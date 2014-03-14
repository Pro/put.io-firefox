
var prefs = null;

/**
 * Set the catch_magnet and catch_torrent setting from preferences
 */
self.port.on("setPrefs", function(prefsPar) {
    prefs = prefsPar;
});

/**
 * Check if url is catchable by put.io
 * @param url url to check
 * @returns {boolean} true if url should be caught
 */
var catchableUrl = function(url) {
    //check for magnet link
    if (prefs.catch_magnet && url.indexOf("magnet:")==0)
        return true;
    else if (prefs.catch_torrent && url.endsWith(".torrent"))
        return true;
    return false;
};

/**
 * Attach to any click event and filter on anchor clicks
 */
window.addEventListener("click", function(event)
{
    // only handle left click
    if (event.which !== 1)
        return;
    var link = event.target;
    while (link && link.localName != "a")
        link = link.parentNode;
    if (!link)
        return;

    // check if URL can be handled by put.io
    if (link && catchableUrl(link.href))
    {
        var title = link.title;
        if (title === null || title.length === 0) {
            title = link.innerText;
        }


        self.port.emit("click", link.href, title);
        event.preventDefault();
    }
}, false);