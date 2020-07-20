var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
var stringbundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle("chrome://signatureswitch/locale/signatureswitch.properties");

var elementIDs = [ "shortcut_onoff_key",
                   "shortcut_onoff_modifier_accel",
                   "shortcut_onoff_modifier_alt",
                   "shortcut_onoff_modifier_control",
                   "shortcut_onoff_modifier_meta",
                   "shortcut_onoff_modifier_shift",
                   "shortcut_cycle_key",
                   "shortcut_cycle_modifier_accel",
                   "shortcut_cycle_modifier_alt",
                   "shortcut_cycle_modifier_control",
                   "shortcut_cycle_modifier_meta",
                   "shortcut_cycle_modifier_shift",
                   "offbydefault",
                   "contextmenu",
                   "composerpath",
                   "encoding",
                   "preloadexecutable",
                   "preloadexecutablepath",
                   "preloadexecutablewait",
                   "initdelay",
                   "autoswitchpriority" ];

var ssTree;
var ssTreeView;

treeView.prototype = {

    invalidate: function()
    {
        this.treebox.invalidate();
    },

    swap: function(idx1, idx2)
    {
        if ((idx1 == idx2) || (idx1 < 0) || (idx2 < 0))
            return;

        var temp = this.items[idx1];

        this.items[idx1] = this.items[idx2];
        this.items[idx2] = temp;

        if (this.defaultsignature == idx1)
        {
            this.defaultsignature = idx2;
        }
        else if (this.defaultsignature == idx2)
        {
            this.defaultsignature = idx1;
        }
    },

    insertItem: function(newItem)
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

    deleteSelectedItem: function()
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

            if (selIdx == this.defaultsignature)
                this.defaultsignature = -1;

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

    getCellText: function(row, column)
    {
        switch (typeof(column) == "object" ? column.id : column)
        {
            case "default":
              return (row == this.defaultsignature ? "Y" : "N");
            case "description":
              return this.items[row].description;
            case "path":
              return this.items[row].path;
            case "shortcut":
              return this.items[row].shortcut;
            case "addresses":
              return this.items[row].addresses;
            case "newsgroups":
              return this.items[row].newsgroups;
            case "mailinglists":
              return this.items[row].mailinglists;
            default:
              return "";
        }
    },

    setTree: function(treebox)
    {
        this.treebox = treebox;
    },

    cycleCell: function(row, column)
    {
        if ((typeof(column) == "object" ? column.id : column) == "default")
        {
            if (row == this.defaultsignature)
            {
                this.defaultsignature = -1;
            }
            else
            {
                var currDef = this.defaultsignature;
                this.defaultsignature = row;
                this.items[row].isVisible = true;
                this.treebox.invalidateCell(currDef, column);
            }
        }

        this.selection.select(row);
        this.treebox.invalidateRow(row);
    },

    getImageSrc: function(row, column)
    {
        if ((typeof(column) == "object" ? column.id : column) == "default")
        {
            if (row == this.defaultsignature)
                return "chrome://signatureswitch/skin/default.png";
        }

        return null;
    },

    get rowCount()
    {
        return this.items.length;
    },

    isContainer: function(row) { return false; },
    isSeparator: function(row) { return false; },
    isSorted: function(row) { return false; },
    cycleHeader: function(col, elem) {},
    getLevel: function(row) { return 0; },
    getRowProperties: function(row) { return "" },
    getCellProperties: function(row, column) { return "" },
    getColumnProperties: function(column) { return "" }
};

function treeView(items, defaultsignature)
{
    this.items = items;
    this.defaultsignature = defaultsignature;
    this.treebox = null;
}

function onLoad()
{
    document.addEventListener("dialogaccept", function() {
        onDialogAccept();
    });

    var elementID;
    var element;
    var elementType;
    var elementDefaultPrefString;
    var elementPrefString;

    setDefaultPrefsForOS();

    for (var i = 0; i < elementIDs.length; i++)
    {
        elementID = elementIDs[i];
        element = document.getElementById(elementID);

        if  (!element) break;

        elementType = element.localName;
        elementDefaultPrefString = element.getAttribute("defaultpref");
        elementPrefString = element.getAttribute("prefstring");

        if (elementType == "radiogroup")
        {
            try
            {
                element.selectedItem = element.childNodes[pref.getIntPref(elementPrefString)];
            }
            catch (e)
            {
                element.selectedItem = element.childNodes[elementDefaultPrefString];
                try
                {
                    pref.setIntPref(elementPrefString, elementDefaultPrefString);
                }
                catch (e) {}
            }
        }
        else if (elementType == "checkbox")
        {
            try
            {
                element.checked = (pref.getBoolPref(elementPrefString));
            }
            catch(e)
            {
                element.checked = (elementDefaultPrefString == "true");
                try
                {
                    pref.setBoolPref(elementPrefString, element.checked);
                }
                catch (e) {}
            }
        }
        else if (elementType == "textbox")
        {
            try
            {
                element.setAttribute("value", pref.getStringPref(elementPrefString));
            }
            catch (e)
            {
                element.setAttribute("value", elementDefaultPrefString);
                try
                {
                    pref.setStringPref(elementPrefString, elementDefaultPrefString);
                }
                catch (e) {}
            }
        }
        else if (elementType == "menulist")
        {
            var menuitem = document.createElement("menuitem");

            try
            {
                menuitem.setAttribute("label", pref.getStringPref(elementPrefString));
            }
            catch (e)
            {
                menuitem.setAttribute("label", elementDefaultPrefString);
                try
                {
                    pref.setStringPref(elementPrefString, elementDefaultPrefString);
                }
                catch (e) {}
            }

            insertMenuItemBeforeFirstSeparator(element, menuitem);
            element.selectedIndex = 0;
        }
    }

    initTree();
    initAutoSwitchPriority();

    if (window.arguments && window.arguments[0])
        document.documentElement.acceptDialog();
}

function initTree()
{
    var treeData = loadTreeData();
    var defaultSignature = -1;

    try
    {
        defaultSignature = parseInt(pref.getCharPref("extensions.signatureswitch.defaultsignature"));
    }
    catch(e) {}

    ssTree = document.getElementById("signatureswitchTree");
    ssTreeView = new treeView(treeData, defaultSignature);
    ssTree.view = ssTreeView;
    ssTreeView.invalidate();
    onSelectItem();
}

function loadTreeData()
{
    var dataString;
    var items = new Array();

    try
    {
        dataString = pref.getStringPref("extensions.signatureswitch.signatures");

        if (dataString != "")
        {
            var itemStrings = dataString.split("|");

            var itemData;

            for (var i = 0; i < itemStrings.length; i ++)
            {
                itemData = itemStrings[i].split("*");

                items.push(new createItem(itemData[0],
                                          itemData[1],
                                          itemData[2],
                                          itemData[3],
                                          itemData[4],
                                          itemData[5]));
            }
        }
    }
    catch (e) {}

    return items;
}

function initAutoSwitchPriority()
{
    var priorityElement = document.getElementById("autoswitchpriority");
    var priorityList = document.getElementById("priorityList");

    var priorityPref;

    try
    {
        priorityPref = pref.getCharPref("extensions.signatureswitch.autoswitchpriority");
    }
    catch(e) {}

    if (priorityPref == null || priorityPref == "")
    {
        priorityPref = priorityElement.getAttribute("defaultpref");
        priorityElement.setAttribute("value", priorityPref);

        try
        {
            pref.setStringPref(priorityElement.getAttribute("prefstring"), priorityPref);
        }
        catch (e) {}
    }

    for (var i = 0; i < priorityPref.length; i++)
    {
        switch (priorityPref.charAt(i))
        {
            case "A":
              priorityList.appendItem(getLocalizedMessage("AutoSwitchPriority.Addresses"), "A");
              break;
            case "N":
              priorityList.appendItem(getLocalizedMessage("AutoSwitchPriority.Newsgroups"), "N");
              break;
            case "M":
              priorityList.appendItem(getLocalizedMessage("AutoSwitchPriority.Mailinglists"), "M");
              break;
        }
    }
}

function onDialogAccept()
{
    var elementID;
    var element;
    var elementType;

    var onOffKey = document.getElementById("shortcut_onoff_key").selectedItem.label;
    var cycleKey = document.getElementById("shortcut_cycle_key").selectedItem.label;

    if ((onOffKey === undefined ? " " : onOffKey)                          != pref.getCharPref("extensions.signatureswitch.shortcut_onoff_key", " ")          ||
        document.getElementById("shortcut_onoff_modifier_accel").checked   != pref.getBoolPref("extensions.signatureswitch.shortcut_onoff_modifier_accel")   ||
        document.getElementById("shortcut_onoff_modifier_alt").checked     != pref.getBoolPref("extensions.signatureswitch.shortcut_onoff_modifier_alt")     ||
        document.getElementById("shortcut_onoff_modifier_control").checked != pref.getBoolPref("extensions.signatureswitch.shortcut_onoff_modifier_control") ||
        document.getElementById("shortcut_onoff_modifier_meta").checked    != pref.getBoolPref("extensions.signatureswitch.shortcut_onoff_modifier_meta")    ||
        document.getElementById("shortcut_onoff_modifier_shift").checked   != pref.getBoolPref("extensions.signatureswitch.shortcut_onoff_modifier_shift")   ||
        (cycleKey === undefined ? " " : cycleKey)                          != pref.getCharPref("extensions.signatureswitch.shortcut_cycle_key", " ")          ||
        document.getElementById("shortcut_cycle_modifier_accel").checked   != pref.getBoolPref("extensions.signatureswitch.shortcut_cycle_modifier_accel")   ||
        document.getElementById("shortcut_cycle_modifier_alt").checked     != pref.getBoolPref("extensions.signatureswitch.shortcut_cycle_modifier_alt")     ||
        document.getElementById("shortcut_cycle_modifier_control").checked != pref.getBoolPref("extensions.signatureswitch.shortcut_cycle_modifier_control") ||
        document.getElementById("shortcut_cycle_modifier_meta").checked    != pref.getBoolPref("extensions.signatureswitch.shortcut_cycle_modifier_meta")    ||
        document.getElementById("shortcut_cycle_modifier_shift").checked   != pref.getBoolPref("extensions.signatureswitch.shortcut_cycle_modifier_shift"))
            alert(getLocalizedMessage("alert.keyBindings"));

    for (var i = 0; i < elementIDs.length; i++)
    {
        elementID = elementIDs[i];
        element = document.getElementById(elementID);

        if  (!element) break;

        elementType = element.localName;

        if  (elementType == "radiogroup")
            pref.setIntPref(element.getAttribute("prefstring"), parseInt(element.value));
        else if  (elementType == "checkbox")
            pref.setBoolPref(element.getAttribute("prefstring"), element.checked);
        else if (elementType == "textbox" && element.preftype == "int")
            pref.setIntPref(element.getAttribute("prefstring"), parseInt(element.getAttribute("value")));
        else if (elementType == "textbox")
            pref.setStringPref(element.getAttribute("prefstring"), element.value);
        else if (elementType == "menulist")
            pref.setStringPref(element.getAttribute("prefstring"), element.selectedItem.label);
    }

    saveTreeData();
    saveAutoSwitchPriority();
}

function saveTreeData()
{
    var dataString = "";
    var rowCount = ssTreeView.rowCount;

    for (var i = 0; i < rowCount ; i++)
    {
        if (dataString == "")
        {
            dataString = ssTreeView.getCellText(i, "description")    + "*" +
                         ssTreeView.getCellText(i, "path")           + "*" +
                         ssTreeView.getCellText(i, "shortcut")       + "*" +
                         ssTreeView.getCellText(i, "addresses")      + "*" +
                         ssTreeView.getCellText(i, "newsgroups")     + "*" +
                         ssTreeView.getCellText(i, "mailinglists");
        }
        else
        {
            dataString = dataString + "|" +
                         ssTreeView.getCellText(i, "description")    + "*" +
                         ssTreeView.getCellText(i, "path")           + "*" +
                         ssTreeView.getCellText(i, "shortcut")       + "*" +
                         ssTreeView.getCellText(i, "addresses")      + "*" +
                         ssTreeView.getCellText(i, "newsgroups")     + "*" +
                         ssTreeView.getCellText(i, "mailinglists");
        }
    }

    pref.setStringPref("extensions.signatureswitch.signatures", dataString);
    pref.setCharPref("extensions.signatureswitch.defaultsignature", ssTreeView.defaultsignature);
}

function saveAutoSwitchPriority()
{
    var priorityList = document.getElementById("priorityList");

    var priorityString = "";

    for (var i = 0; i < priorityList.getRowCount(); i++)
    {
        priorityString = priorityString + priorityList.getItemAtIndex(i).value;
    }

    pref.setCharPref("extensions.signatureswitch.autoswitchpriority", priorityString);
}

function onSelectItem()
{
    var selIdx = ssTreeView.selection.currentIndex;
    var rowCount = ssTreeView.rowCount;

    document.getElementById("button-up").disabled = selIdx <= 0;
    document.getElementById("button-down").disabled = selIdx < 0 || selIdx >= rowCount - 1;
    document.getElementById("button-delete").disabled = selIdx < 0;
    document.getElementById("button-edit").disabled = selIdx < 0;

    return true;
}

function onSelectPriority()
{
    var priorityList = document.getElementById("priorityList");
    var selIdx = priorityList.selectedIndex;
    var rowCount = priorityList.getRowCount();

    document.getElementById("button-priorityUp").disabled = selIdx <= 0;
    document.getElementById("button-priorityDown").disabled = selIdx < 0 || selIdx >= rowCount - 1;

    return true;
}

function setDefaultPrefsForOS()
{
    var composerPath = document.getElementById("composerpath");
    var standardComposer;

    switch (getOS())
    {
          case "win32":
            standardComposer = "C:\\Windows\\system32\\notepad.exe";
            break;
          case "linux":
            standardComposer = "/usr/bin/xed";
            break;
          case "macosx":
            standardComposer = "/Applications/TextEdit.app/Contents/MacOS/TextEdit";
            break;
          default:
            standardComposer = "/usr/bin/xed";
            break;
    }

    composerPath.setAttribute("defaultpref", standardComposer);
}

function getOS()
{
    var np = navigator.platform;
    var ua = navigator.userAgent;

    var rv;

    if (np.indexOf("Win") == 0)
        rv = "win32";
    else if (np.indexOf("Linux") == 0)
        rv = "linux";
    else if (ua.indexOf("Mac OS X") != -1)
        rv = "macosx";
    else if (np.indexOf("Mac") != -1)
        rv = "macos";
    else
        rv = null;

    return rv;
}

function onPickComposer()
{
    return pickFile(getLocalizedMessage("options.pickComposerTitle"), document.getElementById("composerpath"));
}

function onPickPreLoadExecutable()
{
    return pickFile(getLocalizedMessage("options.pickPreLoadExecutableTitle"), document.getElementById("preloadexecutablepath"));
}

function pickFile(localizedTitle, textElement)
{
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window, localizedTitle, Components.interfaces.nsIFilePicker.modeOpen);
    fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);
    fp.open(function(returnValue){
        if (returnValue == Components.interfaces.nsIFilePicker.returnOK)
            textElement.value = fp.file.path;
    });
}

function newItem()
{
    var item = new createItem("", "", " -----", "-", "-", "-");

    window.openDialog("chrome://signatureswitch/content/setsignature.xul",
                      "_blank",
                      "chrome,modal,resizable=yes,dependent=yes",
                      item);

    if (item.path != "" && item.description != "")
    {
        ssTreeView.insertItem(item);
        ssTreeView.invalidate();
    }
}

function editItem()
{
    var selIdx = ssTreeView.selection.currentIndex;

    if (selIdx < 0)
        return;

    window.openDialog("chrome://signatureswitch/content/setsignature.xul",
                      "_blank",
                      "chrome,modal,resizable=yes,dependent=yes",
                      ssTreeView.items[selIdx]);

    ssTreeView.invalidate();
}

function deleteItem()
{
    ssTreeView.deleteSelectedItem();
    ssTree.focus();
}

function createItem(description, path, shortcut, addresses, newsgroups, mailinglists)
{
    this.description = description;
    this.path = path;
    this.shortcut = shortcut;
    this.addresses = addresses;
    this.newsgroups = newsgroups;
    this.mailinglists = mailinglists;
}

function moveItem(moveUp)
{
    var fromIdx = ssTreeView.selection.currentIndex;
    var toIdx;

    ssTree.focus();

    if (moveUp)
    {
        if (fromIdx <= 0)
            return;

        toIdx = fromIdx - 1;
    }
    else
    {
        if (fromIdx >= ssTreeView.rowCount - 1)
            return;

        toIdx = fromIdx + 1;
    }

    ssTreeView.swap(fromIdx, toIdx);
    ssTreeView.invalidate();
    ssTreeView.selection.select(toIdx);
    ssTreeView.treebox.ensureRowIsVisible(toIdx);
}

function movePriority(moveUp)
{
    var priorityList = document.getElementById("priorityList");
    var selectedIndex = priorityList.selectedIndex;
    var targetIndex = moveUp ? selectedIndex - 1 : selectedIndex + 1;

    var selectedItem = priorityList.getItemAtIndex(selectedIndex);
    var selectedLabel = selectedItem.label;
    var selectedValue = selectedItem.value;

    priorityList.focus();

    if (moveUp)
    {
        if (selectedIndex <= 0)
           return;

        priorityList.removeItemAt(selectedIndex);
        priorityList.insertItemAt(targetIndex, selectedLabel, selectedValue);
    }
    else
    {
        if (selectedIndex >= priorityList.getRowCount() - 1)
           return;

        if (selectedIndex == (priorityList.getRowCount() - 2))
        {
           priorityList.removeItemAt(selectedIndex);
           priorityList.appendItem(selectedLabel, selectedValue);
        }
        else
        {
           priorityList.removeItemAt(selectedIndex);
           priorityList.insertItemAt(targetIndex, selectedLabel, selectedValue);
        }
    }

    priorityList.selectItem(priorityList.getItemAtIndex(targetIndex));
}

function getLocalizedMessage(msg)
{
    return stringbundle.GetStringFromName(msg);
}

function openURL(aURL)
{
    var uri = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURI);
    var protocolSvc = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"].getService(Components.interfaces.nsIExternalProtocolService);

    uri.spec = aURL;
    protocolSvc.loadUrl(uri);
}

function insertMenuItemBeforeFirstSeparator(menu, item)
{
    if (menu.hasChildNodes())
    {
        var childNodes = menu.childNodes;

        for (var i = 0; i < childNodes.length; i++)
        {
            var childNode = childNodes[i];

            if (childNode.hasChildNodes())
            {
                if (insertMenuItemBeforeFirstSeparator(childNode, item))
                    return;
            }
            else if (childNode.localName == "menuseparator") {
                menu.insertBefore(item, childNode);
                return true;
            }
        }
    }

    return false;
}

function dump(str)
{
    var csClass = Components.classes['@mozilla.org/consoleservice;1'];
    var cs = csClass.getService(Components.interfaces.nsIConsoleService);

    cs.logStringMessage((new Date()).getTime() + ": " + str);
}
