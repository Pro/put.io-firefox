var pageMod = require('sdk/page-mod');
var data = require('sdk/self').data;
var notifications = require("sdk/notifications");
var _ = require("sdk/l10n").get;
var prefsModule = require("sdk/simple-prefs");
var tabs = require("sdk/tabs");
var PutIO = require('PutIO').PutIO;

var api = new PutIO(prefsModule.prefs.auth_token);

//require("sdk/preferences/service").set("extensions.sdk.console.logLevel", 'all');


String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

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

var addUrlToDownload = function(url, title) {

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

prefsModule.on("auth_token", function() {
   api = new PutIO(prefsModule.prefs.auth_token);
});