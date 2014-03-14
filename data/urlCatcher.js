
var prefs = null;

self.port.on("setPrefs", function(prefsPar) {
    prefs = prefsPar;
});

var catchableUrl = function(url) {
    //check for magnet link
    if (prefs.catch_magnet && url.indexOf("magnet:")==0)
        return true;
    else if (prefs.catch_torrent && url.endsWith(".torrent"))
        return true;
    return false;
};

function getParameterByName(url, name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

window.addEventListener("click", function(event)
{
    // only handle left click
    if (event.which !== 1)
        return;
    var link = event.target;
    while (link && link.localName != "a")
        link = link.parentNode;

    // check if URL can be handled by put.io
    if (link && catchableUrl(link.href))
    {
        var title = null;
        if (link.href.indexOf("magnet:")==0) {
            var displayName = getParameterByName(link.href, "dn");
            if (displayName !== null)
                title = displayName;
        }
        if (title === null || title.length === 0) {
            title = link.title;
        }
        if (title === null || title.length === 0) {
            //if magnet, try to get dn parameter (display name)
            if (title === null || title.length === 0) {
                title = link.innerText;
            }
        }
        self.port.emit("click", link.href, title);
        event.preventDefault();
    }
}, false);