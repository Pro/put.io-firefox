/**
 * Style of "SET" button
 */
$("<style type='text/css'>"+
    " .firefoxAddonSet{ "+
        "color:#ffffff !important;"+
        "font-weight:bold;"+
        "font-size: 0.8em;"+
        "padding:2px 4px 2px 2px;"+
        "background-color:#009933;"+
        "margin-left:10px;"+
        "-webkit-border-radius: 2px;"+
        "-moz-border-radius: 2px;"+
        "border-radius: 2px;"+
"} </style>").appendTo("head");

/**
 * Create the SET button to add to the page
 * @param id folder id
 * @param name folder name
 * @returns {*|jQuery|HTMLElement} the button to add
 */
var getSetButton = function(id, name) {
    var btn = $('<a href="javascript:;" class="firefoxAddonSet">SET </a>');

    btn.click(function() {
        self.postMessage({
            id : id,
            name : name
        });
    });
    return btn;
};

/**
 * Add button to current folder
 */
$("#bc-folder-link").each(function(){
    var elem = $(this);
    var id = elem.attr("data-file-id");
    var name = elem.text();
    var btn = getSetButton(id, name);
    elem.append(btn);
});

/**
 * Folders are dynamically loaded. So add the SET button to any new directory entry
 */
setInterval(function(){
    $('.file-name a[href^="/your-files/"]').each(function() {
        var elem = $(this);
        if (elem.find(".firefoxAddonSet").length > 0)
            return;
        var id = elem.attr("href").substr("/your-files/".length);
        var name = elem.find(".fname").first().text();
        elem.append(getSetButton(id, name));
    });
},200);
