var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);

var elementIDs = [      "general-opensaveasdialog",
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
                        "nofilereference",
                        "prefs-dir",
                        "prefs-lastDir",
                        "prefs-downloadDir",
                        "prefs-defaultFolder",
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

var slifTree;
var slifTreeView;

function treeView(items)
{
    this.items = items;
    this.treebox = null;
}

treeView.prototype = {

    invalidate : function()
    {
        this.treebox.invalidate();
    },

    swap : function(idx1, idx2)
    {
        if ((idx1 == idx2) || (idx1 < 0) || (idx2 < 0))
            return;

        var temp = this.items[idx1];

        this.items[idx1] = this.items[idx2];
        this.items[idx2] = temp;
    },

    insertItem : function(newItem)
    {
        try
        {
            this.items.push(newItem);
            this.treebox.rowCountChanged(this.rowCount, 1);
        }
        catch (err)
        {
            alert(err);
        }
    },

    insertSeparator : function()
    {
        try
        {
            this.items.push(new createItem("---"));
            this.treebox.rowCountChanged(this.rowCount, 1);
        }
        catch (err)
        {
            alert(err);
        }
    },

    deleteSelectedItem : function()
    {
        try
        {
            var selIdx = this.selection.currentIndex;

            if (selIdx < 0)
                return;

            var newItems = new Array();

            for (var i = 0; i < this.items.length; i++)
            {
                if (i != selIdx)
                    newItems.push(this.items[i]);
            }

            this.items = newItems;
            this.treebox.rowCountChanged(selIdx, -1);

            if (newItems.length > 0)
                this.selection.select(selIdx == 0 ? 0 : selIdx - 1);
        }
        catch (err)
        {
            alert(err);
        }
    },

    getCellText : function(row, column)
    {
        switch (typeof(column) == "object" ? column.id : column)
        {
            case "description":
              return this.items[row].description;
            case "path":
              return this.items[row].path;
            case "opensaveasdialog":
              return this.items[row].opensaveasdialog;
            case "openfolder":
              return this.items[row].openfolder;
            case "fileprefix":
              return this.items[row].fileprefix;
            case "fileprefixvalue":
              return this.items[row].fileprefixvalue;
            case "filename":
              return this.items[row].filename;
            case "filenamevalue":
              return this.items[row].filenamevalue;
            case "filesuffix":
              return this.items[row].filesuffix;
            case "filesuffixvalue":
              return this.items[row].filesuffixvalue;
            case "duplicatefilename":
              return this.items[row].duplicatefilename;
            default:
              return "";
        }
    },

    get rowCount()
    {
        return this.items.length;
    },

    setTree : function(treebox)
    {
        this.treebox = treebox;
    },

    isSeparator : function(row)
    {
        return (this.getCellText(row, "description") == "---");
    },

    isContainer: function(row) { return false; },
    isSorted: function(row) { return false; },
    cycleHeader: function(col, elem) {},
    getLevel: function(row) { return 0; },
    getRowProperties: function(row) { return "" },
    getCellProperties: function(row, column) { return "" },
    getColumnProperties: function(column) { return "" },
    getImageSrc: function getImageSrc(index, column) {}
};

function onLoad()
{
    var elementID;
    var element;
    var eltType;
    var defpref;

    for (var i = 0; i < elementIDs.length; i++)
    {
        elementID = elementIDs[i];
        element = document.getElementById(elementID);

        if  (!element) break;

        eltType = element.localName;
        str.data = element.getAttribute("defaultpref");

        if  (eltType == "radiogroup")
        {
            try
            {
                element.selectedItem = element.childNodes[pref.getIntPref(element.getAttribute("prefstring"))];
            }
            catch (e)
            {
                element.selectedItem = element.childNodes[element.getAttribute("defaultpref")];
                try
                {
                    pref.setIntPref(element.getAttribute("prefstring"), element.getAttribute("defaultpref") );
                }
                catch (e) {}
            }
        }
        else if (eltType == "checkbox")
        {
            try
            {
                element.checked = (pref.getBoolPref(element.getAttribute("prefstring")));
            }
            catch(e)
            {
                defpref = element.getAttribute("defaultpref");
                element.checked = (defpref == "true");
                try
                {
                    pref.setBoolPref(element.getAttribute("prefstring"), (defpref == "true"));
                }
                catch (e) {}
            }
        }
        else if (eltType == "textbox")
        {
            try
            {
                element.setAttribute("value", pref.getComplexValue(element.getAttribute("prefstring"), Components.interfaces.nsISupportsString).data);
            }
            catch (e)
            {
                element.setAttribute("value", element.getAttribute("defaultpref"));
                try
                {
                    pref.setComplexValue(element.getAttribute("prefstring"), Components.interfaces.nsISupportsString, str);
                }
                catch (e) {}
            }
        }
        else if (eltType == "menulist")
        {
            try
            {
                element.insertItemAt(0, pref.getComplexValue(element.getAttribute("prefstring"), Components.interfaces.nsISupportsString).data);
                element.selectedIndex = 0;
            }
            catch (e)
            {
                element.insertItemAt(0, element.getAttribute("defaultpref"));
                element.selectedIndex = 0;
                try
                {
                    pref.setComplexValue(element.getAttribute("prefstring"), Components.interfaces.nsISupportsString, str);
                }
                catch (e) {}
            }
        }
    }

    initTree();

    if (window.arguments && window.arguments[0])
        document.documentElement.acceptDialog();
}

function initTree()
{
    var treeData = loadTreeData();
    slifTree = document.getElementById("savelinkinfolderTree");
    slifTreeView = new treeView(treeData);
    slifTree.view = slifTreeView;
    slifTreeView.invalidate();
    onSelectItem();
}

function loadTreeData()
{
    var dataString;
    var items = new Array();

    try
    {
        dataString = pref.getComplexValue("extensions.savelinkinfolder.folders", Components.interfaces.nsISupportsString).data;

        if (dataString != "")
        {
            var itemStrings = dataString.split("|");

            var itemData;

            for (var i = 0; i < itemStrings.length; i ++)
            {
                itemData = itemStrings[i].split("*");
                items.push(new createItem(  itemData[0],
                                            itemData[1],
                                            itemData[2],
                                            itemData[3],
                                            itemData[4],
                                            itemData[5],
                                            itemData[6],
                                            itemData[7],
                                            itemData[8],
                                            itemData[9],
                                            itemData[10] ));
            }
        }
    }
    catch (e) {}

    return items;
}

function onDialogAccept()
{
    var elementID;
    var element;
    var eltType;

    for (var i = 0; i < elementIDs.length; i++)
    {
        elementID = elementIDs[i];
        element = document.getElementById(elementID);

        if (!element) break;

        eltType = element.localName;

        if  (eltType == "radiogroup")
            pref.setIntPref(element.getAttribute("prefstring"), element.value);
        else if  (eltType == "checkbox")
            pref.setBoolPref(element.getAttribute("prefstring"), element.checked);
        else if (eltType == "textbox" && element.preftype == "int")
            pref.setIntPref(element.getAttribute("prefstring"), parseInt(element.getAttribute("value")));
        else if (eltType == "textbox")
        {
            str.data = element.value;
            pref.setComplexValue(element.getAttribute("prefstring"), Components.interfaces.nsISupportsString, str);
        }
        else if (eltType == "menulist")
        {
            str.data = element.selectedItem.label;
            pref.setComplexValue(element.getAttribute("prefstring"), Components.interfaces.nsISupportsString, str);
        }
    }

    saveTreeData();
}

function saveTreeData()
{
    var dataString = "";
    var rowCount = slifTreeView.rowCount;

    for (var i = 0; i < rowCount ; i++)
    {
        if (dataString == "")
        {
            // caution: keep order for backwards-compatibility!
            dataString =    slifTreeView.getCellText(i, "description")       + "*" +
                            slifTreeView.getCellText(i, "path")              + "*" +
                            slifTreeView.getCellText(i, "opensaveasdialog")  + "*" +
                            slifTreeView.getCellText(i, "openfolder")        + "*" +
                            slifTreeView.getCellText(i, "fileprefix")        + "*" +
                            slifTreeView.getCellText(i, "fileprefixvalue")   + "*" +
                            slifTreeView.getCellText(i, "filesuffix")        + "*" +
                            slifTreeView.getCellText(i, "filesuffixvalue")   + "*" +
                            slifTreeView.getCellText(i, "duplicatefilename") + "*" +
                            slifTreeView.getCellText(i, "filename")          + "*" +
                            slifTreeView.getCellText(i, "filenamevalue");
        }
        else
        {
            // caution: keep order for backwards-compatibility!
            dataString =    dataString + "|" +
                            slifTreeView.getCellText(i, "description")       + "*" +
                            slifTreeView.getCellText(i, "path")              + "*" +
                            slifTreeView.getCellText(i, "opensaveasdialog")  + "*" +
                            slifTreeView.getCellText(i, "openfolder")        + "*" +
                            slifTreeView.getCellText(i, "fileprefix")        + "*" +
                            slifTreeView.getCellText(i, "fileprefixvalue")   + "*" +
                            slifTreeView.getCellText(i, "filesuffix")        + "*" +
                            slifTreeView.getCellText(i, "filesuffixvalue")   + "*" +
                            slifTreeView.getCellText(i, "duplicatefilename") + "*" +
                            slifTreeView.getCellText(i, "filename")          + "*" +
                            slifTreeView.getCellText(i, "filenamevalue");
        }
    }

    str.data = dataString;
    pref.setComplexValue("extensions.savelinkinfolder.folders", Components.interfaces.nsISupportsString, str);
}

function onDialogCancel()
{
}

function onSelectItem()
{
    var selIdx = slifTreeView.selection.currentIndex;
    var rowCount = slifTreeView.rowCount;

    document.getElementById("button-up").disabled = selIdx <= 0;
    document.getElementById("button-down").disabled = selIdx < 0 || selIdx >= rowCount - 1;
    document.getElementById("button-delete").disabled = selIdx < 0;
    document.getElementById("button-edit").disabled = selIdx < 0 || slifTreeView.isSeparator(selIdx);

    return true;
}

function newItem()
{
    // caution: keep param-order for backwards-compatibility!
    var item = new createItem("", "", "-", "-", "-", "%yyyy%%MM%%dd%-%hh%%mm%%ss%_", "-", "_SLiF", "0", "-", "%domain%");

    window.openDialog("chrome://savelinkinfolder/content/setfolder.xul",
                      "_blank",
                      "chrome,modal,resizable=yes,dependent=yes",
                      item);

    if (item.path != "" && item.description != "")
    {
        slifTreeView.insertItem(item);
        slifTreeView.invalidate();
    }
}

function insertSeparator()
{
    slifTreeView.insertSeparator();
}

function editItem()
{
    var selIdx = slifTreeView.selection.currentIndex;

    if (selIdx < 0)
        return;

    window.openDialog("chrome://savelinkinfolder/content/setfolder.xul",
                      "_blank",
                      "chrome,modal,resizable=yes,dependent=yes",
                      slifTreeView.items[selIdx]);

    slifTreeView.invalidate();
}

function deleteItem()
{
    slifTreeView.deleteSelectedItem();
    slifTree.focus();
}

// caution: keep param-order for backwards-compatibility!
function createItem(description, path, opensaveasdialog, openfolder, fileprefix, fileprefixvalue, filesuffix, filesuffixvalue, duplicatefilename, filename, filenamevalue)
{
    this.description = (description) ? description : "";
    this.path = (path) ? path : "";
    this.opensaveasdialog = (opensaveasdialog) ? opensaveasdialog : "";
    this.openfolder = (openfolder) ? openfolder : "";
    this.fileprefix = (fileprefix) ? fileprefix : "";
    this.fileprefixvalue = (fileprefixvalue) ? fileprefixvalue : "";
    this.filename = (filename) ? filename : "";
    this.filenamevalue = (filenamevalue) ? filenamevalue : "";
    this.filesuffix = (filesuffix) ? filesuffix : "";
    this.filesuffixvalue = (filesuffixvalue) ? filesuffixvalue : "";
    this.duplicatefilename = (duplicatefilename) ? duplicatefilename : "";
}

function moveItem(moveUp)
{
    var fromIdx = slifTreeView.selection.currentIndex;
    var toIdx;

    slifTree.focus();

    if (moveUp)
    {
        if (fromIdx <= 0)
            return;

        toIdx = fromIdx - 1;
    }
    else
    {
        if (fromIdx >= slifTreeView.rowCount - 1)
            return;

        toIdx = fromIdx + 1;
    }

    slifTreeView.swap(fromIdx, toIdx);
    slifTreeView.invalidate();
    slifTreeView.selection.select(toIdx);
    slifTreeView.treebox.ensureRowIsVisible(toIdx);
}

function onPickExecutable()
{
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window, getLocalizedMessage("setFolder.pickExecutableTitle"), Components.interfaces.nsIFilePicker.modeOpen);
    fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);

    var res = fp.show();

    if (res == Components.interfaces.nsIFilePicker.returnOK)
        document.getElementById("executable-path").value = fp.file.path;

    return true;
}

function getLocalizedMessage(msg)
{
    return document.getElementById("savelinkinfolder.locale").getString(msg);
}

function clearPref(prefname)
{
    var button = document.getElementById("button-prefs-" + prefname);

    pref.setCharPref("browser.download." + prefname, "");
    button.disabled = true;

    return true;
}

function openURL(aURL)
{
    var windowManager = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService();
    var windowManagerInterface = windowManager.QueryInterface(Components.interfaces.nsIWindowMediator);
    var win = windowManagerInterface.getMostRecentWindow("navigator:browser");

    if (win)
    {
        var theTab = win.gBrowser.addTab(aURL);
        win.gBrowser.selectedTab = theTab;
        return;
    }
}
