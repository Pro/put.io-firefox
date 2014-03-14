/**
 * Only show "Download" context menu entry if anchor clicked
 */
self.on("context", function (node) {
    return node.localName == 'a';
});

/**
 * Click handler for "Download" context menu
 */
self.on("click", function (node, data) {
    var title = node.title;
    if (title === null || typeof title==="undefined" || title.length === 0) {
        title = node.innerText || node.textContent;
    }
    self.postMessage({
        url : node.href,
        title : title
    });
});