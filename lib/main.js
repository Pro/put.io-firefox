var pageMod = require('sdk/page-mod');
var data = require('sdk/self').data;
var notifications = require("sdk/notifications");
var _ = require("sdk/l10n").get;
var prefsModule = require("sdk/simple-prefs");
var tabs = require("sdk/tabs");

//require("sdk/preferences/service").set("extensions.sdk.console.logLevel", 'all');

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};


exports.main = function () {

    pageMod.PageMod({
        include: ['*'],
        contentScriptWhen: 'ready',
        contentScriptFile: [data.url('urlCatcher.js')],
        onAttach: function (worker) {
            worker.port.emit("setPrefs",prefsModule.prefs);
            worker.port.on("click", function (href, title) {
                // url clicked which was approved by urlCatcher

                notifications.notify({
                    title: _('notification_download_added'),
                    text: title,
                    iconURL: data.url("images/icon64.png"),
                    data: href,
                    onClick: function (data) {
                        tabs.open({
                            url: "https://put.io/transfers"
                        });
                    }
                });
            });
        }
    });
};


prefsModule.on("auth_token_btn", function () {
    tabs.open({
        url: "https://api.put.io/v2/oauth2/authenticate?client_id=202&response_type=code&redirect_uri=http://profanter.me/putio",
        onReady: function (tab) {
            tab.attach({
                contentScript: 'var tokenTag = document.getElementById("token");  if (typeof tokenTag !== "undefined") {self.postMessage(tokenTag.innerHTML);}',
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