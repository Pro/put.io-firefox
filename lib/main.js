var pageMod = require('sdk/page-mod');
var data = require('sdk/self').data;
var notifications = require("sdk/notifications");
var _ = require("sdk/l10n").get;
var prefsModule = require("sdk/simple-prefs");
var tabs = require("sdk/tabs");
var PutIO = require('PutIO').PutIO;

var api = new PutIO(prefsModule.prefs.auth_token);

//require("sdk/preferences/service").set("extensions.sdk.console.logLevel", 'all');

/**
 * Check if API response is an error
 * @param response the api response object
 * @returns {boolean} true if no error, false if api call resulted in error
 */
var checkErrorResponse = function(response){
    console.log(response);
  if (response.status === "ERROR") {
      if (response.error_type === "Unauthorized" || response.error_type === "invalid_grant") {
          notifications.notify({
              title: _('notification_error_api'),
              text: _('notification_error_unauthorized'),
              iconURL: data.url("images/icon64_error.png")
          });
      } else {
          var error = response.error_message;
          if (error == null)
            error = response.error_type;
          notifications.notify({
              title: _('notification_error_api'),
              text: error,
              iconURL: data.url("images/icon64_error.png")
          });
      }
      return false;
  } else {
      return true;
  }
};

/**
 * Extract parameter from url
 * @param url Full url
 * @param name name of the parameter to get
 * @returns {string} value of the parameter or null if not found.
 */
function getParameterByName(url, name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/**
 * Queue url to put.io transfers.
 * @param url URL to queue
 * @param title name of the file/url
 */
var addUrlToDownload = function(url, title) {

    if (url.indexOf("magnet:")==0) {
        var displayName = getParameterByName(url, "dn");
        if (displayName !== null)
            title = displayName;
    }
    if (title === null || typeof title==="undefined" || title.length === 0)
        title=url;

    api.transfers.add(url, prefsModule.prefs.download_folder, true, function(retVal) {
        if (!checkErrorResponse(retVal))
            return;

        notifications.notify({
            title: _('notification_download_added'),
            text: title,
            iconURL: data.url("images/icon64.png"),
            data: url,
            onClick: function (data) {
                tabs.open({
                    url: "https://put.io/transfers"
                });
            }
        });
    });
}

/**
 * Add context menu on anchors
 */
require("sdk/context-menu").Item({
    label: _('context_menu_download'),
    image: data.url("images/icon48.png"),
    contentScriptFile: [data.url('contextMenu/download.js')],
    onMessage: function (msgData) {
        addUrlToDownload(msgData.url,msgData.title);
    }
});

exports.main = function () {

    // catch .torrent and magnet clicks
    pageMod.PageMod({
        include: ['*'],
        contentScriptWhen: 'ready',
        contentScriptFile: [data.url('urlCatcher.js')],
        onAttach: function (worker) {
            worker.port.emit("setPrefs",prefsModule.prefs);
            worker.port.on("click", function (href, title) {
                // url clicked which was approved by urlCatcher
                addUrlToDownload(href, title)
            });
        }
    });
};

/**
 * If auth_token button clicked (on preferences page), open token page and extract token automatically
 */
prefsModule.on("auth_token_btn", function () {
    tabs.open({
        url: "https://api.put.io/v2/oauth2/authenticate?client_id=202&response_type=code&redirect_uri=http://profanter.me/putio",
        onReady: function (tab) {
            tab.attach({
                contentScript: 'var tokenTag = document.getElementById("token");  if (tokenTag !== null && typeof tokenTag !== "undefined") {self.postMessage(tokenTag.innerHTML);}',
                onMessage: function (token) {
                    prefsModule.prefs.auth_token = token;
                    notifications.notify({
                        title: _('notification_token_set'),
                        text: token,
                        iconURL: data.url("images/icon64.png")
                    });
                    tab.close();
                }
            });
        }
    });
});

/**
 * If download folder button clicked (on preferences page), open put.io file list and wait until user selects folder.
 */
prefsModule.on("download_folder_btn", function () {

    var folderId = prefsModule.prefs.download_folder;
    var url = "https://put.io/your-files"
    if (folderId !== "") {
        url += "/" + folderId;
    }
    tabs.open({
        url: url,
        onReady: function (tab) {
            tab.attach({
                contentScriptFile: [data.url("jquery-2.1.0.min.js"), data.url('folderSelector.js')],
                onMessage: function (msgData) {
                    prefsModule.prefs.download_folder = msgData.id;
                    notifications.notify({
                        title: _('notification_download_folder_set'),
                        text: msgData.name + " (" + msgData.id + ")",
                        iconURL: data.url("images/icon64.png")
                    });
                    tab.close();
                }
            });
        }
    });
});

/**
 * If auth_token changes, create new api with corresponding token.
 */
prefsModule.on("auth_token", function() {
   api = new PutIO(prefsModule.prefs.auth_token);
});