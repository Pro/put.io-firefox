PutIO.BrowserOverlay = {

  init : function(aEvent) {
    PutIO.UI.init();
    PutIO.Preferences.init();
  },

  saveLink : function() {
    let saveLinkNotificationValue = "putioSaveLinkNotification" + Math.random();
    let notificationWindow = gBrowser.contentWindow;

    // check that the API Key and Secret are not empty
    if (PutIO.Preferences.accessToken === null || PutIO.Preferences.accessToken === "") {

      PutIO.UI.replaceNotification(
        notificationWindow,
        ["putio.preferences.notification.label"],
        saveLinkNotificationValue,
        "PRIORITY_INFO_LOW",
        ["preferences"]
      );

    } else {

      PutIO.UI.replaceNotification(
        notificationWindow,
        ["putio.saveLink.notification.label"],
        saveLinkNotificationValue,
        "PRIORITY_INFO_LOW",
        []
      );

      let putioRequest = {
        api_key    : PutIO.Preferences.apiKey,
        api_secret : PutIO.Preferences.apiSecret,
        params     : {
          links : [gContextMenu.linkURL],
		  save_parent_id : PutIO.Preferences.downloadFolder === null || PutIO.Preferences.downloadFolder.length == 0 ? 0 : PutIO.Preferences.downloadFolder
        }
      };
	  let parent = PutIO.Preferences.downloadFolder === null || PutIO.Preferences.downloadFolder.length == 0 ? "" : "&save_parent_id=" + PutIO.Preferences.downloadFolder;
      let url = "https://api.put.io/v2/transfers/add?oauth_token=" +PutIO.Preferences.accessToken;
      Application.console.log("Url: " + url);
	  let request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
      request.onload = function(aEvent) {
		Application.console.log("Response: " + aEvent.target.responseText);
        let putioResponse = JSON.parse(aEvent.target.responseText);
        if (putioResponse.error === null || !putioResponse.error) {
          // Put.io add transfer success!
          PutIO.UI.replaceNotification(
            notificationWindow,
            ["putio.saveLink.notification.load_success"],
            saveLinkNotificationValue,
            "PRIORITY_INFO_MEDIUM",
            ["active transfers"]
          );
          // remove notification after 1 minute
          let timeoutID = setTimeout(
            PutIO.UI.removeNotification,
            0.5*60*1000,
            notificationWindow,
            saveLinkNotificationValue
          );
        } else {
          // Put.io error occurred
          PutIO.UI.replaceNotification(
            notificationWindow,
            ["putio.saveLink.notification.load_error", [putioResponse.error_message]],
            saveLinkNotificationValue,
            "PRIORITY_WARNING_HIGH",
            []
          );
        }
      };
      request.onerror = function(aEvent) {
        PutIO.UI.replaceNotification(
          notificationWindow,
          ["putio.saveLink.notification.http_error", [aEvent.target.status, aEvent.target.statusText]],
          saveLinkNotificationValue,
          "PRIORITY_WARNING_LOW",
          []
        );
      };
	  let post = "url=" +encodeURIComponent(gContextMenu.linkURL) + parent;
      request.open("POST", url, true);
	  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	  request.setRequestHeader("Content-length", post.length);
	  Application.console.log("Post: " +post);
      request.send(post);
    }

  }

};

window.addEventListener("load", function () {
  PutIO.BrowserOverlay.init();
}, false);
