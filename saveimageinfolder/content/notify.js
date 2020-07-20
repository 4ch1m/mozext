var timeout;

var duration;
var folder;
var filename;
var filepath;
var fullfilepath;

var browser;

function onNotifyLoad()
{
    duration = window.arguments[0].duration;
    folder = window.arguments[0].folder;
    filename = window.arguments[0].filename;
    filepath = window.arguments[0].filepath;
    fullfilepath = window.arguments[0].fullfilepath;

    browser = window.arguments[1];

    document.getElementById("siifNotifyFile").value = filename;
    document.getElementById("siifNotifyFolder").value = folder;

    window.sizeToContent();
    window.moveTo(window.opener.screenX + window.opener.outerWidth - window.outerWidth, window.opener.screenY + window.opener.outerHeight - window.outerHeight);

    timeout = setTimeout( function() { window.close(); }, duration);
}

function onNotifyClick(target)
{
    clearTimeout(timeout);

    var tmpFile = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
    var ioService = Components.classes['@mozilla.org/network/io-service;1'].createInstance(Components.interfaces.nsIIOService);

    tmpFile.initWithPath(target);

    var uri = ioService.newFileURI(tmpFile).spec;

    browser.selectedTab = browser.addTab(uri);

    window.close();
}
