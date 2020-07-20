var slif_pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.savelinkinfolder.");
var slif_prompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
var slif_ioService = Components.classes['@mozilla.org/network/io-service;1'].createInstance(Components.interfaces.nsIIOService);

var slif_htmlIndex = null;

var slif_statusBarInterval = null;
var slif_statusBarMessage = null;
var slif_statusBarTimeout = 3000;

var slif_main = {

    onLoad : function()
    {
        slif_main.ensurePrefs();
        document.getElementById("contentAreaContextMenu").addEventListener("popupshowing", slif_main.initContextMenu, false);
    },

    ensurePrefs : function()
    {
        var prefs = [   "general-opensaveasdialog",
                        "general-openfolder",
                        "general-fileprefix",
                        "general-fileprefixvalue",
                        "general-filename",
                        "general-filenamevalue",
                        "general-filesuffix",
                        "general-filesuffixvalue",
                        "general-duplicatefilenamevalue",
                        "hideinvalidfolders",
                        "executable",
                        "executable-path",
                        "executable-arguments",
                        "prefs-dir",
                        "prefs-lastDir",
                        "prefs-downloadDir",
                        "prefs-defaultFolder",
                        "nofilereference",
                        "hideunknowncontenttype",
                        "unknowncontenttypeselected",
                        "shortcut",
                        "numericshortcuts",
                        "nofilereference-filename",
                        "nofilereference-fileextension",
                        "nofilereference-showdialog",
                        "notification-statusbar",
                        "notification-popupwindow",
                        "notification-duration",
                        "randomstring-length"               ];

        for (var i = 0; i < prefs.length; i++)
        {
            if (slif_pref.getPrefType(prefs[i]) == slif_pref.PREF_INVALID)
            {
                slif_main.openOptions(true);
                return;
            }
        }
    },

    initContextMenu : function()
    {
        var show = gContextMenu.onSaveableLink || (gContextMenu.inDirList && gContextMenu.onLink);

        document.getElementById("slif_menu").setAttribute("accesskey", slif_pref.getCharPref("shortcut"));
        gContextMenu.showItem("slif_menu", show);
    },

    initMenuPopup : function(element)
    {
        var menuPopup = document.getElementById("slif_menupopup-" + element);
        slif_main.removeMenuItems(menuPopup);

        var descriptionData = slif_main.loadFolderData(0);
        var pathData = slif_main.loadFolderData(1);

        var numericShortcuts = slif_pref.getBoolPref("numericshortcuts");

        var command;
        var pathValidation;

        var shortcutCount = 0;

        for (var i = 0; i < descriptionData.length; i++)
        {
            if (descriptionData[i] == "---")
            {
                slif_main.insertSeparatorItem(menuPopup);
            }
            else
            {
                pathValidation = slif_main.validateDirectory(pathData[i]);

                command = (element == "context") ? "slif_main.saveLinkInFolder(event, " + i + ")" : "slif_main.browseWithinFirefox(event, " + i + ")";

                if (!(slif_pref.getBoolPref("hideinvalidfolders") && !pathValidation))
                    slif_main.insertMenuItem(menuPopup, descriptionData[i], pathData[i], command, !pathValidation, (numericShortcuts && shortcutCount < 10) ? shortcutCount : "");

                shortcutCount ++;
            }
        }

        if (descriptionData.length > 0)
            menuPopup.appendChild(document.createElement("menuseparator"));

        if (element == "context")
            slif_main.insertBrowseItem(menuPopup, slif_main.getLocalizedMessage("context.browseFolders.label"));

        slif_main.insertOptionsItem(menuPopup, slif_main.getLocalizedMessage("context.editFolders.label"));
    },

    loadFolderData : function(idx)
    {
        var dataString;
        var items = new Array();

        try
        {
            dataString = slif_pref.getComplexValue("folders", Components.interfaces.nsISupportsString).data;

            if (dataString != "")
            {
                var itemStrings = dataString.split("|");

                var itemData;

                for (var i = 0; i < itemStrings.length; i ++)
                {
                    itemData = itemStrings[i].split("*");
                    items.push(itemData[idx]);
                }
            }
        }
        catch (e) {}

        return items;
    },

    removeMenuItems : function(menu)
    {
        var children = menu.childNodes;

        for (var i = children.length - 1; i >= 0; i--)
        {
            menu.removeChild(children[i]);
        }
    },

    insertMenuItem : function(menu, label, tooltip, command, disabled, accesskey)
    {
        var item = document.createElement("menuitem");

        item.setAttribute("id", "savelinkinfolder_folder_" + (menu.childNodes.length + 1));
        item.setAttribute("label", label);
        item.setAttribute("tooltiptext", tooltip);
        item.setAttribute("oncommand", command + "; event.stopPropagation();");
        item.setAttribute("disabled", disabled);
        item.setAttribute("accesskey", accesskey);

        menu.appendChild(item);

        return item;
    },

    insertSeparatorItem : function(menu)
    {
        var item = document.createElement("menuseparator");

        menu.appendChild(item);

        return item;
    },

    insertBrowseItem : function(menu, label)
    {
        var item = document.createElement("menuitem");

        item.setAttribute("id", "savelinkinfolder_browseFolders");
        item.setAttribute("label", label);
        item.setAttribute("tooltiptext", slif_main.getLocalizedMessage("context.browseFolders.toolTip"));
        item.setAttribute("oncommand", "slif_main.createHtmlIndex(event); event.stopPropagation();");
        item.setAttribute("disabled", false);

        menu.appendChild(item);

        return item;
    },

    insertOptionsItem : function(menu, label)
    {
        var item = document.createElement("menuitem");

        item.setAttribute("id", "savelinkinfolder_openOptions");
        item.setAttribute("label", label);
        item.setAttribute("tooltiptext", slif_main.getLocalizedMessage("context.editFolders.toolTip"));
        item.setAttribute("oncommand", "slif_main.openOptions(false); event.stopPropagation();");
        item.setAttribute("disabled", false);

        menu.appendChild(item);

        return item;
    },

    validateDirectory : function(path)
    {
        var isValid = false;

        try
        {
            var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
            file.initWithPath(path);
            isValid = file.isDirectory();
        }
        catch (e) {}

        return isValid;
    },

    saveLinkInFolder : function(event, idx)
    {
        var folder = slif_main.loadFolderData(1)[idx];
        var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);

        if (folder)
        {
            try
            {
                var link = slif_main.getContextMenuLinkURL();
                var uriObject = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI(link, null, null);
                var fileObject = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                var fname = slif_main.getDefaultFileName(uriObject);
                var fnameUnknown = ((link.indexOf("?") > -1 && link.indexOf("=") > -1) || fname.indexOf(".") == -1);
                var name = fname.substring(0, fname.lastIndexOf("."));
                var ext = fname.substring(fname.lastIndexOf(".") + 1);
                var keepExtension = true;

                var opensaveasdialog;
                var openfolder;
                var fileprefix;
                var fileprefixvalue;
                var filename;
                var filenamevalue;
                var filesuffix;
                var filesuffixvalue;
                var duplicatefilename;

                var executable = slif_pref.getBoolPref("executable");
                var executable_path = slif_pref.getComplexValue("executable-path", Components.interfaces.nsISupportsString).data;
                var executable_arguments = slif_pref.getComplexValue("executable-arguments", Components.interfaces.nsISupportsString).data;

                var nofilereference = slif_pref.getBoolPref("nofilereference");
                var nofilereference_filename = slif_pref.getComplexValue("nofilereference-filename", Components.interfaces.nsISupportsString).data;
                var nofilereference_fileextension = slif_pref.getComplexValue("nofilereference-fileextension", Components.interfaces.nsISupportsString).data;
                var nofilereference_showdialog = slif_pref.getBoolPref("nofilereference-showdialog");

                var prefs_dir = slif_pref.getBoolPref("prefs-dir");
                var prefs_downloaddir = slif_pref.getBoolPref("prefs-downloadDir");
                var prefs_lastdir = slif_pref.getBoolPref("prefs-lastDir");
                var prefs_defaultfolder = slif_pref.getBoolPref("prefs-defaultFolder");

                var notification_statusbar = slif_pref.getBoolPref("notification-statusbar");
                var notification_popupwindow = slif_pref.getBoolPref("notification-popupwindow");
                var notification_duration = parseInt(slif_pref.getComplexValue("notification-duration", Components.interfaces.nsISupportsString).data) * 1000;

                if (event.metaKey)
                {
                    slif_main.browseWithinFirefox(event, idx);
                    return;
                }

                if (event.ctrlKey)
                {
                    if (executable)
                        slif_main.openFolderWithExecutable(executable_path, executable_arguments, folder);
                    else
                        slif_main.openFolderWithLaunchMethod(folder);

                    return;
                }

                if (event.shiftKey)
                {
                    opensaveasdialog = slif_pref.getBoolPref("general-opensaveasdialog");
                    openfolder = slif_pref.getBoolPref("general-openfolder");
                    fileprefix = slif_pref.getBoolPref("general-fileprefix");
                    fileprefixvalue = slif_pref.getComplexValue("general-fileprefixvalue", Components.interfaces.nsISupportsString).data;
                    filename = slif_pref.getBoolPref("general-filename");
                    filenamevalue = slif_pref.getComplexValue("general-filenamevalue", Components.interfaces.nsISupportsString).data;
                    filesuffix = slif_pref.getBoolPref("general-filesuffix");
                    filesuffixvalue = slif_pref.getComplexValue("general-filesuffixvalue", Components.interfaces.nsISupportsString).data;
                    duplicatefilename = slif_pref.getIntPref("general-duplicatefilenamevalue");
                }
                else
                {
                    // caution: keep order for backwards-compatibility!
                    opensaveasdialog = (slif_main.loadFolderData(2)[idx] == "X");
                    openfolder = (slif_main.loadFolderData(3)[idx] == "X");
                    fileprefix = (slif_main.loadFolderData(4)[idx] == "X");
                    fileprefixvalue = slif_main.loadFolderData(5)[idx];
                    filesuffix = (slif_main.loadFolderData(6)[idx] == "X");
                    filesuffixvalue = slif_main.loadFolderData(7)[idx];
                    duplicatefilename = parseInt(slif_main.loadFolderData(8)[idx]);
                    filename = (slif_main.loadFolderData(9)[idx] == "X");
                    filenamevalue = slif_main.loadFolderData(10)[idx];

                    // legacy support
                    if (isNaN(duplicatefilename))
                        duplicatefilename = (slif_main.loadFolderData(8)[idx] == "X") ? 3 : 0;
                }
            }
            catch (e)
            {
                return;
            }

            str.data = folder;

            slif_pref.setComplexValue("lastusedfolder", Components.interfaces.nsISupportsString, str);

            if (fnameUnknown)
            {
                slif_main.promptAlert(slif_main.getLocalizedMessage("context.noFile"));

                if (!nofilereference)
                    return;
            }

            if (filename || fileprefix || filesuffix || fnameUnknown)
            {
                if (filename)
                    name = (filenamevalue != "") ? filenamevalue : "file";

                if (fileprefix)
                    name = fileprefixvalue + name;

                if (filesuffix)
                    name = name + filesuffixvalue;

                if (fnameUnknown)
                {
                    name = slif_main.parameterReplace(nofilereference_filename, link);
                    ext = nofilereference_fileextension;
                    opensaveasdialog = nofilereference_showdialog;
                    keepExtension = false;
                }

                fname = name + "." + ext;

                fname = slif_main.variableReplace(fname);
            }

            if (opensaveasdialog)
            {
                var newLocation = slif_main.openSaveAsDialog(fileObject, folder, fname, keepExtension);

                if (newLocation[0] == null || newLocation[1] == null) return;

                folder = newLocation[0];
                fname = newLocation[1];
            }

            fileObject.initWithPath(folder);
            fileObject.append(fname);

            if (fileObject.exists() && !opensaveasdialog)
            {
                switch (duplicatefilename)
                {
                    case 0:
                        var newLocation = slif_main.openSaveAsDialog(fileObject, folder, fname, keepExtension);
                        if (newLocation[0] == null || newLocation[1] == null) return;
                        folder = newLocation[0];
                        fname = newLocation[1];
                        fileObject.initWithPath(folder);
                        fileObject.append(fname);
                        break;

                    case 1:
                        fileObject.createUnique(0, 0777);
                        break;

                    case 2:
                        return;

                    case 3:
                        fileObject.remove(true);
                        break;
                }
            }
            
            var acObject = new AutoChosen(fileObject, uriObject);
            
            // try-n-catch orgy due to compatibility reasons; pretty ugly but it should do the trick ;-)
            try
            {
            	// try to choose the right internalSave-method ...
            	switch (internalSave.length)
            	{
	            	case 12:
	                    internalSave(link, null, fname, null, null, false, null, acObject, null, gBrowser.contentDocument, false, null);
	            		break;
	            	case 11:
	                    internalSave(link, null, fname, null, null, false, null, acObject, null, false, null);
	            		break;
	            	default:
	                    internalSave(link, null, fname, null, null, false, null, acObject, null, false);
	            		break;
            	}
            }
            catch (e)
            {
                saveURL(link, fileObject, null, false, false, null);
            }

            if (openfolder)
            {
                if (executable)
                    slif_main.openFolderWithExecutable(executable_path, executable_arguments, folder);
                else
                    slif_main.openFolderWithLaunchMethod(folder);
            }

            if (prefs_dir || prefs_lastdir || prefs_downloaddir || prefs_defaultfolder)
            {
                var browser_pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("browser.download.");

                str.data = folder;

                if (prefs_dir)
                    browser_pref.setComplexValue("dir", Components.interfaces.nsISupportsString, str);

                if (prefs_lastdir)
                    browser_pref.setComplexValue("lastDir", Components.interfaces.nsISupportsString, str);

                if (prefs_downloaddir)
                    browser_pref.setComplexValue("downloadDir", Components.interfaces.nsISupportsString, str);

                if (prefs_defaultfolder)
                    browser_pref.setComplexValue("defaultFolder", Components.interfaces.nsISupportsString, str);
            }

            if (notification_statusbar)
            {
                slif_statusBarTimeout = notification_duration;

                slif_main.stopStatusBarInterval();
                slif_statusBarMessage = slif_main.getLocalizedMessage("statusBar.saved") + " " + fileObject.path;
                slif_statusBarInterval = window.setInterval("slif_main.doStatusBarInterval()", 1);
                window.setTimeout("slif_main.stopStatusBarInterval()", slif_statusBarTimeout);
            }

            if (notification_popupwindow)
            {
                var notifyItem = new slif_main.createNotifyItem(notification_duration, slif_main.loadFolderData(0)[idx], fileObject.leafName, fileObject.path.substring(0, fileObject.path.length - fileObject.leafName.length - 1), fileObject.path);
                window.openDialog("chrome://savelinkinfolder/content/notify.xul", "", "chrome,dialog=yes,titlebar=no,popup=yes", notifyItem, getBrowser());
            }
        }
    },

    createHtmlIndex : function(event)
    {
        if (event.ctrlKey)
        {
            slif_main.openOptions(false);
            return;
        }

        var htmlFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("TmpD", Components.interfaces.nsIFile);
        htmlFile.append("slif_index.html");

        try
        {
            if (htmlFile.exists())
                htmlFile.remove(false);

            htmlFile.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
        }
        catch (e)
        {
            htmlFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
        }

        var descriptionData = slif_main.loadFolderData(0);
        var pathData = slif_main.loadFolderData(1);

        var htmlData = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\">";
        htmlData += "<html>";
        htmlData += "<head><title>Save Link in Folder</title></head>";
        htmlData += "<body bgcolor=\"#ffffff\"><table border=\"0\" style=\"width: 100%; height: 100%;\">";
        htmlData += "<tr><td><div align=\"center\">";
        htmlData += "<strong>Save Link in Folder</strong><br><br>";
        htmlData += "<table border=\"0\">";

        var folderObject = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        var folderEntries;
        var folderEntriesCount;

        for (var i = 0; i < descriptionData.length; i++)
        {
            if (descriptionData[i] != "---")
            {
                folderObject.initWithPath(pathData[i]);

                if (slif_main.validateDirectory(pathData[i]))
                {
                    folderEntries = folderObject.directoryEntries;
                    folderEntriesCount = 0;

                    while(folderEntries.hasMoreElements())
                    {
                        folderEntries.getNext();
                        folderEntriesCount ++;
                    }

                    htmlData += "<tr><td align=\"right\"><nobr><a href=\"" + slif_ioService.newFileURI(folderObject).spec + "\">" + descriptionData[i] + "</a></nobr></td><td align=\"left\"><nobr>&nbsp;<small>(" + folderEntriesCount + " " + slif_main.getLocalizedMessage("htmlIndex.entries") + "; " + slif_main.getLocalizedMessage("htmlIndex.lastModified") + ": " + (new Date(folderObject.lastModifiedTime)).toLocaleString() + ")</small></nobr></td></tr>";
                }
                else
                {
                    htmlData += "<tr><td align=\"right\">" + descriptionData[i] + "</td><td align=\"left\">&nbsp;-</td></tr>";
                }
            }
        }

        htmlData += "</table></div></td></tr></table></body></html>";

        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
        foStream.init(htmlFile, 0x02 | 0x08 | 0x20, 0664, 0);
        foStream.write(htmlData, htmlData.length);
        foStream.close();

        slif_htmlIndex = htmlFile.path;
        slif_main.browseWithinFirefox(event, -1);
    },

    browseWithinFirefox : function(event, idx)
    {
        var folder = (idx < 0) ? slif_htmlIndex : slif_main.loadFolderData(1)[idx];
        var folderObject = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

        folderObject.initWithPath(folder);

        var url = slif_ioService.newFileURI(folderObject).spec;

        if (event.ctrlKey)
        {
            var executable = slif_pref.getBoolPref("executable");
            var executable_path = slif_pref.getComplexValue("executable-path", Components.interfaces.nsISupportsString).data;
            var executable_arguments = slif_pref.getComplexValue("executable-arguments", Components.interfaces.nsISupportsString).data;

            if (executable)
                slif_main.openFolderWithExecutable(executable_path, executable_arguments, folder);
            else
                slif_main.openFolderWithLaunchMethod(folder);

            return;
        }

        if (event.metaKey)
            getBrowser().addTab(url);
        else
            loadURI(url);
    },

    // compatibility issue
    getContextMenuLinkURL : function()
    {
        if (gContextMenu.linkURL.length)
            return(gContextMenu.linkURL);
        else
            return(gContextMenu.linkURL());
    },

    // compatibility issue
    getDefaultFileName : function(uri)
    {
        var fileName;

        try
        {
            fileName = getDefaultFileName(null, uri, null, null);
        }
        catch (e)
        {
            fileName = getDefaultFileName(null, null, uri, null);
        }

        return fileName;
    },

    variableReplace : function(inval)
    {
        var retval = "" + inval;

        var date = new Date();

        var dd = "" + date.getDate();
        var MM = "" + (date.getMonth() + 1);
        var yyyy = "" + date.getFullYear();

        var hh = "" + date.getHours();
        var mm = "" + date.getMinutes();
        var ss = "" + date.getSeconds();

        if (dd.length == 1)
            dd = "0" + dd;

        if (MM.length == 1)
            MM = "0" + MM;

        if (hh.length == 1)
            hh = "0" + hh;

        if (mm.length == 1)
            mm = "0" + mm;

        if (ss.length == 1)
            ss = "0" + ss;

        retval = slif_main.replaceIt(retval, "%dd%", dd);
        retval = slif_main.replaceIt(retval, "%MM%", MM);
        retval = slif_main.replaceIt(retval, "%yyyy%", yyyy);
        retval = slif_main.replaceIt(retval, "%hh%", hh);
        retval = slif_main.replaceIt(retval, "%mm%", mm);
        retval = slif_main.replaceIt(retval, "%ss%", ss);

        var url = "" + document.commandDispatcher.focusedWindow.location.href;
        var title = "" + document.commandDispatcher.focusedWindow.document.title;
        var domain = "";

        url = unescape(url.substr(url.indexOf("//") + 2));
        domain = url.substr(0, url.indexOf("/"));

        url = slif_main.getPortableFileName(url);
        title = slif_main.getPortableFileName(title);

        retval = slif_main.replaceIt(retval, "%url%", url);
        retval = slif_main.replaceIt(retval, "%title%", title);
        retval = slif_main.replaceIt(retval, "%domain%", domain);

        var guid = slif_main.generateGuid();
        retval = slif_main.replaceIt(retval, "%guid%", guid);

        var random = slif_main.generateRandomString(parseInt(slif_pref.getComplexValue("randomstring-length", Components.interfaces.nsISupportsString).data));
        retval = slif_main.replaceIt(retval, "%random%", random);

        var clipboard = slif_main.getStringFromClipboard();

        if (clipboard)
            retval = slif_main.replaceIt(retval, "%clipboard%", slif_main.getPortableFileName(clipboard));
    else
            retval = slif_main.replaceIt(retval, "%clipboard%", "empty"); // todo

        return retval;
    },

    parameterReplace : function(inval, link)
    {
        var retval = "" + inval;
        var param = null;

        while ((param = /%(\w+=)%/.exec(retval)) != null)
        {
            param = param[1];

            var paramre = new RegExp('\\W' + param + "(\\w+)");
            var paramvalue = paramre.exec(link);

            paramvalue = (paramvalue != null) ? paramvalue[1] : "unk";

            retval = slif_main.replaceIt(retval, "%" + param + "%", paramvalue);
        }

        retval = slif_main.replaceIt(retval, "%ALL_PARAMETERS%", link.substring(link.indexOf("?") + 1));

        return slif_main.getPortableFileName(retval);
    },

    replaceIt : function(inval, search, replace)
    {
        var retval = "" + inval;
        var pos;

        while (retval.indexOf(search) > -1)
        {
            pos = retval.indexOf(search);
            retval = "" + (retval.substring(0, pos) + replace + retval.substring((pos + search.length), retval.length));
        }

        return retval;
    },

    getPortableFileName : function(fileName)
    {
       return fileName.replace(/[\\\/\:\*\?\"\<\>\| ]+/g, "_");
    },

    openSaveAsDialog : function(fileObject, filePath, fileName, keepExtension)
    {
        var oldExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
        var newExtension;

        try
        {
            fileObject.initWithPath(filePath);

            var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);

            fp.init(window, slif_main.getLocalizedMessage("context.saveAs"), Components.interfaces.nsIFilePicker.modeSave);
            fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);
            fp.defaultString = fileName;
            fp.displayDirectory = fileObject;

            var res = fp.show();

            if ((res == Components.interfaces.nsIFilePicker.returnOK) || (res == Components.interfaces.nsIFilePicker.returnReplace))
            {
                fileName = fp.file.leafName;
                filePath = fp.file.path.substring(0, fp.file.path.length - fileName.length);

                if (keepExtension)
                {
                    newExtension = fileName.substring(fileName.lastIndexOf(".") + 1);

                    if (newExtension != oldExtension)
                        fileName = fileName + "." + oldExtension;
                }
            }
            else
            {
                filePath = null;
                fileName = null;
            }
        }
        catch (e)
        {
            filePath = null;
            fileName = null;
        }

        return (new Array(filePath, fileName));
    },

    openFolderWithExecutable : function(exe, arg, fol)
    {
        var executableObject = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);

        var args = arg.split(" ");

        for (var i=0; i < args.length; ++i)
        {
            if (args[i].indexOf("%path%") > -1)
                args[i] = slif_main.replaceIt(args[i], "%path%", fol);
        }

        executableObject.initWithPath(exe);

        if (executableObject.exists())
        {
            if (executableObject.isExecutable())
            {
                process.init(executableObject);
                process.run(false, args, args.length);
            }
        }
        else
        {
            slif_main.promptAlert(slif_main.getLocalizedMessage("context.executableNotFound"));
        }
    },
    
    openFolderWithLaunchMethod : function(folder)
    {
       var folderObject = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        
       try
       {
          folderObject.initWithPath(folder);
          folderObject.launch();
	   }
       catch (e) {} // FF4.0 throws exception upon launch()
    },

    setStatusBar : function(msg)
    {
    	var statusbar = document.getElementById("statusbar-display");
    	
		// FF4.0 doesn't have a statusbar anymore
    	if (statusbar != null)
    		statusbar.label = msg;
    	else
    		document.defaultView.XULBrowserWindow.setOverLink(msg);
    },

    doStatusBarInterval : function()
    {
        slif_main.setStatusBar(slif_statusBarMessage);
    },

    stopStatusBarInterval : function()
    {
        window.clearInterval(slif_statusBarInterval);
    },

    getLocalizedMessage : function(msg)
    {
        return document.getElementById("savelinkinfolder.locale").getString(msg);
    },

    promptAlert : function(msg)
    {
        return slif_prompt.alert(window, "Save Link in Folder", msg);
    },

    openOptions : function(autosave)
    {
        return window.openDialog("chrome://savelinkinfolder/content/options.xul", "_blank", "chrome, modal, resizable=yes", autosave);
    },

    createNotifyItem : function(duration, folder, filename, filepath, fullfilepath)
    {
        this.duration     = (duration)     ? duration     : "";
        this.folder       = (folder)       ? folder       : "";
        this.filename     = (filename)     ? filename     : "";
        this.filepath     = (filepath)     ? filepath     : "";
        this.fullfilepath = (fullfilepath) ? fullfilepath : "";
    },

    generateGuid : function()
    {
        var result = "";
        var i = 0;

        for (var j = 0; j < 32; j++)
        {
            if ( j ==  8 ||
                 j == 12 ||
                 j == 16 ||
                 j == 20 )
                result = result + "-";

            i = Math.floor(Math.random() * 16).toString(16).toUpperCase();

            result = result + i;
        }

        return result;
    },

    generateRandomString : function(randomStringLength)
    {
        var randomString = "";

        var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        var position = 0;

        for (var i = 0; i < randomStringLength; i++)
        {
            position = Math.floor(Math.random() * chars.length);
            randomString += chars.substring(position, position + 1);
        }

        return randomString;
    },

    getStringFromClipboard : function()
    {
        var clip = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);

        if (!clip)
            return false;

        var trans = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);

        if (!trans)
            return false;

        if ('init' in trans)
      	  trans.init(null);
        
        trans.addDataFlavor("text/unicode");
        clip.getData(trans, clip.kGlobalClipboard);

        var str = new Object();
        var strLength = new Object();

        try
        {
            trans.getTransferData("text/unicode", str, strLength);
        }
        catch (e)
        {
            return false;
        }

        if (!str)
            return false;

        str = str.value.QueryInterface(Components.interfaces.nsISupportsString);

        return str.data.substring(0, strLength.value / 2);
    }
};

window.addEventListener("load", slif_main.onLoad, false);
