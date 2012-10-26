PutIO.Preferences = {

  // global variables to hold the Put.io API Key and Secret preferences
  _prefAccessToken    : null,
  _prefDownloadFolder : null,

  get accessToken() {
    return this._prefAccessToken === null ? "" : this._prefAccessToken.value;
  },

  
  get downloadFolder() {
    return this._prefDownloadFolder.value;
  },

  init : function() {
    this._prefAccessToken    = Application.prefs.get("extensions.putio.accessToken"   );
    this._prefDownloadFolder = Application.prefs.get("extensions.putio.downloadFolder");
  }

};
