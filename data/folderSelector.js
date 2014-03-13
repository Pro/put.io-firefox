
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

setInterval(function(){
    $('.file-name a[href^="/your-files/"]').each(function() {
        var elem = $(this);
        if (elem.find(".firefoxAddonSet").length > 0)
            return;
        var id = elem.attr("href").substr("/your-files/".length);
        var name = elem.find(".fname").first().text();
        var btn = $('<a href="javascript:;" class="firefoxAddonSet">SET </a>');

        btn.click(function() {
            self.postMessage({
                id : id,
                name : name
            });
        });
        elem.append(btn);
    });
},200);

//self.postMessage(tokenTag.innerHTML);