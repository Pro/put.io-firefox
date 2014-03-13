
prefs = null;

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

window.addEventListener("click", function(event)
{
    var link = event.target;
    while (link && link.localName != "a")
        link = link.parentNode;

    // check if URL can be handled by put.io
    if (link && catchableUrl(link.href))
    {
        self.port.emit("click", link.href, link.title);
        event.preventDefault();
    }
}, false);