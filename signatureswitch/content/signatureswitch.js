var ss_loadStatus = false;
var ss_initStatus = false;

var ss_signature = new Array();
var ss_startNode = null;

var ss_autoSwitch = false;
var ss_autoSwitchAddresses = new Array();
var ss_autoSwitchNewsgroups = new Array();
var ss_autoSwitchMailinglists = new Array();

var ss_cycleIndex = null;

var ss_prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.signatureswitch.");
var ss_stringbundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle("chrome://signatureswitch/locale/signatureswitch.properties");

var ss_main = {

    signatureSwitch : function()
    {
        var currentEditor = GetCurrentEditor();
        var currentEditorDom = currentEditor.rootElement;
        var currentEditorDomChilds = currentEditorDom.childNodes;

        var initialRange = currentEditor.selection.getRangeAt(0).cloneRange();

        currentEditor.beginTransaction();

        if (ss_signature.length > 0)
        {
            ss_main.insertSignature(currentEditor, currentEditorDom, currentEditorDomChilds);
        }
        else
        {
            if (ss_main.searchSignature(currentEditorDomChilds))
                ss_main.removeSignature(currentEditor);
        }

        currentEditor.selection.removeAllRanges();
        currentEditor.selection.addRange(initialRange);

        currentEditor.endTransaction();
    },

    searchSignature : function(nodes)
    {
        var node = null;
        var nodeText = "";

        for (var i = (nodes.length - 1) ; i >= 0 ; i--)
        {
            node = nodes[i];

            if (node.hasChildNodes())
            {
                if (node.hasAttributes())
                {
                    if (node.getAttribute("class") == "moz-signature")
                    {
                        ss_startNode = node;
                        return true;
                    }
                }
                else
                {
                    if (ss_main.searchSignature(node.childNodes))
                        return true;
                }
            }

            try
            {
                nodeText = node.nodeValue;

                if ((nodeText.substring(0, 3) == "-- ") && (nodeText.length <= 5))
                {
                    ss_startNode = node;
                    return true;
                }
            }
            catch (e) {}
        }

        return false;
    },

    removeSignature : function(editor)
    {
        if (GetCurrentEditorType() == "textmail")
        {
            var currentNode = ss_startNode;
            var nextNode;

            while (currentNode)
            {
                ss_signature.push(currentNode.cloneNode(true));
                nextNode = currentNode.nextSibling;
                editor.deleteNode(currentNode);
                currentNode = nextNode;
            }
        }
        else
        {
            ss_signature.push(ss_startNode.cloneNode(true));
            editor.deleteNode(ss_startNode);
        }
    },

    insertSignature : function(editor, element, nodes)
    {
        ss_signature.reverse();

        while (ss_signature.length > 0)
        {
            editor.insertNode(ss_signature.pop(), element, nodes.length);
        }

        ss_signature = new Array();
    },

    cycleSignature : function()
    {
        var maxSigIdx = ss_main.loadSignatureProperty(0).length - 1;

        if (ss_cycleIndex == maxSigIdx || ss_cycleIndex > maxSigIdx)
           ss_cycleIndex = 0;
        else
           ss_cycleIndex ++;

        ss_main.loadSignature(ss_cycleIndex, true);
    },

    loadSignature : function(idx, del)
    {
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
        var filePath = ss_main.replaceDirectoryVariable(ss_main.loadSignatureProperty(1)[idx]);

        file.initWithPath(filePath);

        if (!file.exists())
            return;

        var shouldRunPreloadExecutable = ss_prefs.getBoolPref("preloadexecutable");

        if (shouldRunPreloadExecutable)
            ss_main.runPreLoadExecutable(filePath);

        var signature = ss_main.loadFile(file);

        if (signature.indexOf("\r\n") > -1)
            signature = signature.split("\r\n").join("\n");

        // special treatment for those Apple-fanboys
        if (signature.indexOf("\r") > -1)
            signature = signature.split("\r").join("\n");

        if (signature.indexOf("\n%\n") > -1)
        {
            var fpIndex = signature.indexOf("\n$\n");
            var fpContent = null;

            if (fpIndex > -1)
            {
                fpContent = ss_main.dehybrid(signature.substring(0, fpIndex));
                signature = signature.substr(fpIndex + 3);
            }

            var fortuneCookies = signature.split("\n%\n");

            signature = ss_main.dehybrid(fortuneCookies[ss_main.rand(fortuneCookies.length) - 1] + "\n");

            if (fpContent)
                signature = fpContent + "\n" + signature;
        }
        else
        {
            signature = ss_main.dehybrid(signature);
        }

        var currentEditor = GetCurrentEditor();
        var currentEditorDom = currentEditor.rootElement;
        var currentEditorDomChilds = currentEditorDom.childNodes;

        var initialRange = currentEditor.selection.getRangeAt(0).cloneRange();
        var initialModCount = currentEditor.getModificationCount();

        var hasSignature = ss_main.searchSignature(currentEditorDomChilds);

        currentEditor.beginTransaction();

        if (hasSignature && del)
        {
            ss_main.removeSignature(currentEditor);
            currentEditorDomChilds = currentEditorDom.childNodes;
        }

        currentEditor.endOfDocument();

        var newRange = currentEditor.selection.getRangeAt(0).cloneRange();
        var editorIsEmpty = ss_main.trim(ss_main.concatenateNodeValues(currentEditorDomChilds)) == "";

        if ((newRange.startOffset == 1 && !editorIsEmpty) || (initialModCount == 0 && !hasSignature))
            currentEditor.insertLineBreak();

        if (GetCurrentEditorType() == "textmail")
        {
            if (signature.indexOf("-- \n") == -1 && signature != "")
                signature = "-- \n" + signature;

            currentEditor.insertText(signature);
        }
        else
        {
            if (signature.toLocaleLowerCase().indexOf("file://") > -1)
                signature = ss_main.convertFileURIsToDataURIs(signature);

            if (signature.indexOf("-- \n") == -1 && signature.indexOf("-- <") == -1 && signature != "")
                signature = "-- <br>" + signature ;

            signature = "<div class=\"moz-signature\">" + signature + "</div>";

            currentEditor.insertHTML(signature);
        }

        currentEditor.endTransaction();

        currentEditor.selection.removeAllRanges();
        currentEditor.selection.addRange(initialRange);

        ss_main.sanitize();
    },

    runPreLoadExecutable : function(signaturePath)
    {
        var preLoadExecutable = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
        var preLoadExecutablePath = ss_prefs.getStringPref("preloadexecutablepath");
        var preLoadExecutableWait = ss_prefs.getBoolPref("preloadexecutablewait");

        preLoadExecutable.initWithPath(preLoadExecutablePath);

        if (!preLoadExecutable.exists())
            return false;

        Recipients2CompFields(gMsgCompose.compFields);

        var preLoadExecutableArgs = new Array(signaturePath);
        preLoadExecutableArgs = preLoadExecutableArgs.concat(document.getElementById("msgSubject").value);
        preLoadExecutableArgs = preLoadExecutableArgs.concat([getCurrentIdentity().email]);
        preLoadExecutableArgs = preLoadExecutableArgs.concat(ss_main.getAddressesFromCompField(gMsgCompose.compFields.to));
        preLoadExecutableArgs = preLoadExecutableArgs.concat(ss_main.getAddressesFromCompField(gMsgCompose.compFields.cc));
        preLoadExecutableArgs = preLoadExecutableArgs.concat(ss_main.getAddressesFromCompField(gMsgCompose.compFields.bcc));
        preLoadExecutableArgs = preLoadExecutableArgs.concat(gMsgCompose.compFields.newsgroups.split(","));

        var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
        process.init(preLoadExecutable);
        process.run(preLoadExecutableWait, preLoadExecutableArgs, preLoadExecutableArgs.length);
    },

    concatenateNodeValues : function(nodes)
    {
        var nodeValue = "";
        var nodeValues = "";

        for (var i = (nodes.length - 1) ; i >= 0 ; i--)
        {
            if (nodes[i].hasChildNodes())
                nodeValues = nodeValues + ss_main.concatenateNodeValues(nodes[i].childNodes);

            try
            {
                nodeValue = nodes[i].nodeValue;

                if (nodeValue)
                    nodeValues = nodeValues + nodeValue;
            }
            catch (e) {}
        }

        return nodeValues;
    },

    trim : function(inString)
    {
        inString = inString.replace( /^\s+/g, "" );
        inString = inString.replace( /\s+$/g, "" );

        return inString;
    },

    sanitize : function()
    {
        ss_initStatus = false;
        ss_signature = new Array();
        ss_startNode = null;
    },

    onLoad : function()
    {
        if (ss_loadStatus)
            return;

        ss_main.ensurePrefs();
        ss_main.registerShortcuts();
        ss_main.modifyAddressingWidget();
        ss_main.init();

        ss_loadStatus = true;
    },

    ensurePrefs : function()
    {
        var prefs = [ "shortcut_onoff_key",
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
                      "encoding",
                      "preloadexecutable",
                      "preloadexecutablepath",
                      "preloadexecutablewait",
                      "initdelay",
                      "autoswitchpriority" ];

        for (var i = 0; i < prefs.length; i++)
        {
            if (ss_prefs.getPrefType(prefs[i]) == ss_prefs.PREF_INVALID)
            {
                ss_main.openOptions(true);
                return;
             }
        }
    },

    init : function()
    {
        if (ss_initStatus)
            return;

        var defaultsignature;
        var offbydefault;
        var contextmenu;
        var initdelay;

        try
        {
            defaultsignature = parseInt(ss_prefs.getCharPref("defaultsignature"));
            offbydefault = ss_prefs.getBoolPref("offbydefault");
            contextmenu = ss_prefs.getBoolPref("contextmenu");
            initdelay = parseInt(ss_prefs.getCharPref("initdelay"));
        }
        catch (e)
        {
            defaultsignature = -1;
            offbydefault = false;
            contextmenu = true;
            initdelay = 1000;
        }

        var ctxmenu = document.getElementById("SignatureSwitchContext");

        ctxmenu.setAttribute("hidden", !contextmenu);

        ss_autoSwitchAddresses    = ss_main.loadSignatureProperty(3);
        ss_autoSwitchNewsgroups   = ss_main.loadSignatureProperty(4);
        ss_autoSwitchMailinglists = ss_main.loadSignatureProperty(5);

        ss_autoSwitch = ( ss_main.checkAutoSwitchArray(ss_autoSwitchAddresses)    ||
                          ss_main.checkAutoSwitchArray(ss_autoSwitchNewsgroups)   ||
                          ss_main.checkAutoSwitchArray(ss_autoSwitchMailinglists) );

        if ((defaultsignature > -1) || offbydefault || ss_autoSwitch)
            setTimeout("ss_main.delayedInit(" + defaultsignature + ", " + offbydefault + ")", initdelay);

        ss_initStatus = true;
    },

    delayedInit : function(defaultsignature, offbydefault)
    {
        var hasDefaultSignature = defaultsignature > -1;
        var hasAccountSignature = false;
        var autoSwitched = ss_main.autoSwitch();

        ss_cycleIndex = (hasDefaultSignature) ? defaultsignature : 0;

        try
        {
            hasAccountSignature = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("mail.identity." + document.getElementById("msgIdentity").value + ".").getBoolPref("attach_signature");
        }
        catch (e) {}

        if (!autoSwitched && hasDefaultSignature)
            ss_main.loadSignature(defaultsignature, (hasAccountSignature || ss_initStatus));

        if (offbydefault && (hasAccountSignature || hasDefaultSignature || autoSwitched))
            ss_main.signatureSwitch();
    },

    initMenuPopup : function(element)
    {
        var menuPopup = document.getElementById("SignatureSwitchMenuPopup-" + element);

        ss_main.removeMenuItems(menuPopup);

        if (element != "toolbar")
        {
            ss_main.insertOnOffItem(menuPopup, ss_main.getLocalizedMessage("menuItem.onOff"), ss_main.getLocalizedMessage("toolTip.onOff"), "SignatureSwitchKey");
            menuPopup.appendChild(document.createElement("menuseparator"));
        }

        var descriptionData = ss_main.loadSignatureProperty(0);
        var pathData = ss_main.loadSignatureProperty(1);

        var description;
        var path;
        var validation;
        var shortcut;

        for (var i = 0; i < descriptionData.length; i++)
        {
            description = descriptionData[i];
            path = ss_main.replaceDirectoryVariable(pathData[i]);
            validation = ss_main.validateFile(path);
            shortcut = document.getElementById("signatureswitch_shortcut_" + i);

            if (shortcut)
                shortcut = shortcut.id;

            ss_main.insertMenuItem(menuPopup, description, path, i, !validation, shortcut);
        }

        if (descriptionData.length > 0)
            menuPopup.appendChild(document.createElement("menuseparator"));

        ss_main.insertOptionsItem(menuPopup, ss_main.getLocalizedMessage("menuItem.options"), ss_main.getLocalizedMessage("toolTip.enterOptions"));
    },

    registerShortcuts : function()
    {
        var shortcut;

        // common shortcuts ...

        var shortcut_names = new Array("onoff", "cycle");
        var shortcut_name;

        var shortcut_key;
        var shortcut_modifier_accel;
        var shortcut_modifier_alt;
        var shortcut_modifier_control;
        var shortcut_modifier_meta;
        var shortcut_modifier_shift;

        var shortcut_modifiers;

        while (shortcut_names.length > 0)
        {
            shortcut_name = shortcut_names.pop();

            try
            {
                shortcut_key              = ss_prefs.getCharPref("shortcut_" + shortcut_name + "_key");
                shortcut_modifier_accel   = ss_prefs.getBoolPref("shortcut_" + shortcut_name + "_modifier_accel");
                shortcut_modifier_alt     = ss_prefs.getBoolPref("shortcut_" + shortcut_name + "_modifier_alt");
                shortcut_modifier_control = ss_prefs.getBoolPref("shortcut_" + shortcut_name + "_modifier_control");
                shortcut_modifier_meta    = ss_prefs.getBoolPref("shortcut_" + shortcut_name + "_modifier_meta");
                shortcut_modifier_shift   = ss_prefs.getBoolPref("shortcut_" + shortcut_name + "_modifier_shift");
            }
            catch (e)
            {
                shortcut_key              = (shortcut_name == "onoff") ? "Y" : "C";
                shortcut_modifier_accel   = false;
                shortcut_modifier_alt     = false;
                shortcut_modifier_control = true;
                shortcut_modifier_meta    = false;
                shortcut_modifier_shift   = true;
            }

            shortcut_modifiers = new Array();

            if (shortcut_modifier_accel)
                shortcut_modifiers.push("accel");
            if (shortcut_modifier_alt)
                shortcut_modifiers.push("alt");
            if (shortcut_modifier_control)
                shortcut_modifiers.push("control");
            if (shortcut_modifier_meta)
                shortcut_modifiers.push("meta");
            if (shortcut_modifier_shift)
                shortcut_modifiers.push("shift");

            shortcut = document.getElementById("SignatureSwitchKey_" + shortcut_name);
            shortcut.setAttribute("key", shortcut_key);
            shortcut.setAttribute("modifiers", shortcut_modifiers.join(","));
        }

        // signature shortcuts ...

        var shortcutData = ss_main.loadSignatureProperty(2);
        var shortcutKeyset = document.getElementById("SignatureSwitchShortcuts");
        var shortcutString;

        for (var i = 0; i < shortcutData.length; i++)
        {
            shortcutString = shortcutData[i];

            shortcut = document.createElement("key");
            shortcut.setAttribute("id", "signatureswitch_shortcut_" + i);

            shortcut_key = shortcutString.charAt(0);

            if (shortcut_key == " ")
            {
                shortcut.setAttribute("key", "");
                shortcut.setAttribute("modifiers", "");
                shortcut.setAttribute("oncommand", "");
            }
            else
            {
                shortcut_modifiers = new Array();

                if (shortcutString.charAt(1) == "X")
                    shortcut_modifiers.push("accel");
                if (shortcutString.charAt(2) == "X")
                    shortcut_modifiers.push("alt");
                if (shortcutString.charAt(3) == "X")
                    shortcut_modifiers.push("control");
                if (shortcutString.charAt(4) == "X")
                    shortcut_modifiers.push("meta");
                if (shortcutString.charAt(5) == "X")
                    shortcut_modifiers.push("shift");

                shortcut.setAttribute("key", shortcut_key);
                shortcut.setAttribute("modifiers", shortcut_modifiers.join(","));
                shortcut.setAttribute("oncommand", "ss_main.loadSignature(" + i + ", true);");
            }

            shortcutKeyset.appendChild(shortcut);
        }
    },

    modifyAddressingWidget : function()
    {
        var addressingWidget = document.getElementById("addressingWidget");

        addressingWidget.setAttribute("onkeydown", "ss_main.autoSwitch(); " + addressingWidget.getAttribute("onkeydown"));
        addressingWidget.setAttribute("onkeyup",   "ss_main.autoSwitch(); " + addressingWidget.getAttribute("onkeyup"));
        addressingWidget.setAttribute("onclick",   "ss_main.autoSwitch(); " + addressingWidget.getAttribute("onclick"));
        addressingWidget.setAttribute("onblur",    "ss_main.autoSwitch(); " + addressingWidget.getAttribute("onblur"));
    },

    loadSignatureProperty : function(idx)
    {
        var dataString;
        var items = new Array();

        try
        {
            dataString = ss_prefs.getStringPref("signatures");

            if (dataString != "")
            {
                var itemStrings = dataString.split("|");

                var itemData;

                for (var i = 0; i < itemStrings.length; i ++)
                {
                    itemData = itemStrings[i].split("*");

                    items.push((itemData[idx]) ? itemData[idx] : "");
                }
            }
        }
        catch (e) {}

        return items;
    },

    loadFile : function(file)
    {
        var data = "";

        var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
        var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
        var sconverter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

        try
        {
            fstream.init(file, 1, 0, false);
            sstream.init(fstream);
            data += sstream.read(-1);
            sstream.close();
            fstream.close();

            sconverter.charset = ss_prefs.getCharPref("encoding");
            data = sconverter.ConvertToUnicode(data);
        }
        catch (e) {}

        return data;
    },

    removeMenuItems : function(menu)
    {
        var children = menu.childNodes;

        for (var i = children.length - 1; i >= 0; i--)
        {
            menu.removeChild(children[i]);
        }
    },

    insertMenuItem : function(menu, label, tooltip, idx, disabled, key)
    {
        var item = document.createElement("menuitem");

        item.setAttribute("id", "signatureswitch_signature_" + idx);
        item.setAttribute("label", label);
        item.setAttribute("tooltiptext", tooltip);
        item.setAttribute("oncommand", "ss_main.loadSignature(" + idx + ", true); event.stopPropagation();");
        item.setAttribute("disabled", disabled);

        if (key)
            item.setAttribute("key", key);

        menu.appendChild(item);
    },

    insertOptionsItem : function(menu, label, tooltip)
    {
        var item = document.createElement("menuitem");

        item.setAttribute("id", "signatureswitch_openOptions");
        item.setAttribute("label", label);
        item.setAttribute("tooltiptext", tooltip);
        item.setAttribute("oncommand", "ss_main.openOptions(false); event.stopPropagation();");
        item.setAttribute("disabled", false);

        menu.appendChild(item);
    },

    insertOnOffItem : function(menu, label, tooltip, key)
    {
        var item = document.createElement("menuitem");

        item.setAttribute("id", "signatureswitch_onOff");
        item.setAttribute("label", label);
        item.setAttribute("tooltiptext", tooltip);
        item.setAttribute("oncommand", "ss_main.signatureSwitch(); event.stopPropagation();");
        item.setAttribute("key", key);
        item.setAttribute("disabled", false);

        menu.appendChild(item);
    },

    replaceDirectoryVariable : function(path)
    {
        if (path.substring(0,1) != "%")
             return path;

        var returnPath = path;

        try
        {
            var dirVar = path.substring(1, path.indexOf("%", 1));
            returnPath = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get(dirVar, Components.interfaces.nsIFile).path + path.substring(path.indexOf("%", 1) + 1);
        }
        catch (e) {}

        return returnPath;
    },

    validateFile : function(path)
    {
        var isValid = false;

        try
        {
            var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
            file.initWithPath(path);
            isValid = file.isFile();
        }
        catch (e) {}

        return isValid;
    },

    rand : function(n)
    {
        return (Math.floor(Math.random() * n + 1));
    },

    getLocalizedMessage : function(msg)
    {
        return ss_stringbundle.GetStringFromName(msg);
    },

    openOptions : function(autosave)
    {
        return window.openDialog("chrome://signatureswitch/content/options.xul", "_blank", "chrome, modal, resizable=yes", autosave);
    },

    fromChanged : function()
    {
        if ( parseInt(ss_prefs.getCharPref("defaultsignature")) > -1 &&
             ss_main.searchSignature(GetCurrentEditor().rootElement.childNodes) )
        {
            GetCurrentEditor().beginTransaction();
            ss_main.removeSignature(GetCurrentEditor());
            GetCurrentEditor().endTransaction();
        }

        ss_main.sanitize();
        ss_main.init();
    },

    autoSwitch : function()
    {
        if (!ss_autoSwitch)
            return false;

        var priority = ss_prefs.getCharPref("autoswitchpriority");

        Recipients2CompFields(gMsgCompose.compFields);

        var emailAddresses = ss_main.getAddressesFromCompField(gMsgCompose.compFields.to);
        var newsgroups = gMsgCompose.compFields.newsgroups;
        var mailinglists = new Array();

        var rx = null;
        var rx_wildcard = null;

        var chosenAutoSwitchSignatureForAddresses = -1;
        var chosenAutoSwitchSignatureForNewsgroups = -1;
        var chosenAutoSwitchSignatureForMailinglists = -1;

        if (emailAddresses.length > 0 && ss_autoSwitchAddresses.length > 0)
        {
            var rx_user = "([a-zA-Z0-9][a-zA-Z0-9_.-]*|\"([^\\\\\x80-\xff\015\012\"]|\\\\[^\x80-\xff])+\")";
            var rx_domain = "([a-zA-Z0-9][a-zA-Z0-9._-]*\\.)*[a-zA-Z0-9][a-zA-Z0-9._-]*\\.[a-zA-Z]{2,5}";

            rx = "^" + rx_user + "\@" + rx_domain + "$";
            rx_wildcard = "[a-zA-Z0-9._-]*";

            var address;
            var addresses = new Array();

            for (var i = 0; i < emailAddresses.length; i++)
            {
                address = emailAddresses[i];

                if (address.charAt(0) == "\"" && address.charAt(address.length - 1) == "\"")
                   mailinglists.push(address.substring(1, address.length - 1));
                else
                   addresses.push(address);
            }

            chosenAutoSwitchSignatureForAddresses = ss_main.findMatchingAutoSwitchSignature(addresses, ss_autoSwitchAddresses, rx, rx_wildcard);
        }

        if (newsgroups && ss_autoSwitchNewsgroups.length > 0)
        {
            rx = "[a-zA-Z0-9][a-zA-Z0-9_.-]*";
            rx_wildcard = "[a-zA-Z0-9._-]*";

            chosenAutoSwitchSignatureForNewsgroups = ss_main.findMatchingAutoSwitchSignature(newsgroups.split(","), ss_autoSwitchNewsgroups, rx, rx_wildcard);
        }

        if (mailinglists.length > 0 && ss_autoSwitchMailinglists.length > 0)
        {
            rx = "[:alnum:]*";
            rx_wildcard = "[:alnum:]*";

            chosenAutoSwitchSignatureForMailinglists = ss_main.findMatchingAutoSwitchSignature(mailinglists, ss_autoSwitchMailinglists, rx, rx_wildcard);
        }

        if ( chosenAutoSwitchSignatureForAddresses    > -1 ||
             chosenAutoSwitchSignatureForNewsgroups   > -1 ||
             chosenAutoSwitchSignatureForMailinglists > -1  )
        {
            for (var j = 0; j < priority.length; j++)
            {
                switch (priority.charAt(j))
                {
                    case "A":
                      if (chosenAutoSwitchSignatureForAddresses > -1)
                      {
                          ss_main.loadSignature(chosenAutoSwitchSignatureForAddresses, true);
                          return true;
                      }
                      break;

                    case "N":
                      if (chosenAutoSwitchSignatureForNewsgroups > -1)
                      {
                          ss_main.loadSignature(chosenAutoSwitchSignatureForNewsgroups, true);
                          return true;
                      }
                      break;

                    case "M":
                      if (chosenAutoSwitchSignatureForMailinglists > -1)
                      {
                          ss_main.loadSignature(chosenAutoSwitchSignatureForMailinglists, true);
                          return true;
                      }
                      break;
                }
            }
        }

        return false;
    },

    getAddressesFromCompField : function(compField)
    {
        var addresses = new Array();

        var parser = Components.classes["@mozilla.org/messenger/headerparser;1"].getService(Components.interfaces.nsIMsgHeaderParser);
        var addressCount = parser.parseHeadersWithArray(compField, addresses, [], []);

        // transform array of PRUnichar* into array with normal strings
        for (var i = 0; i < addressCount; i++)
        {
            addresses[i] = addresses.value[i];
        }

        return addresses;
    },

    findMatchingAutoSwitchSignature : function(inputValues, autoSwitchTriggers, regEx, regExWildcard)
    {
        var inputValue;

        var autoSwitchTrigger;
        var autoSwitchTriggerRegEx;

        var validate = new RegExp(regEx);

        for (var i = 0; i < inputValues.length; i++)
        {
            inputValue = inputValues[i];

            if (validate.test(inputValue))
            {
                for (var j = 0; j < autoSwitchTriggers.length; j++)
                {
                    autoSwitchTrigger = autoSwitchTriggers[j].split(";");

                    for (var k = 0; k < autoSwitchTrigger.length; k++)
                    {
                        if (autoSwitchTrigger[k].indexOf("?") > -1)
                        {
                            autoSwitchTriggerRegEx = new RegExp(autoSwitchTrigger[k].split("?").join(regExWildcard));
                            match = autoSwitchTriggerRegEx.test(inputValue);
                        }
                        else
                        {
                            match = (autoSwitchTrigger[k].toLowerCase() == inputValue.toLowerCase());
                        }

                        if (match)
                            return j;
                    }
                }
            }
        }

        return -1;
    },

    checkAutoSwitchArray : function(autoSwitchArray)
    {
        for (var i = 0; i < autoSwitchArray.length; i++)
        {
            if (autoSwitchArray[i].length > 1)
                return true;
        }

        return false;
    },

    dehybrid : function(hybridString)
    {
        var hybridSeparator = hybridString.indexOf("\n=\n");

        if (hybridSeparator > -1)
        {
            var plainPart = hybridString.substring(0, hybridSeparator);
            var htmlPart = hybridString.substr(hybridSeparator + 3);

            return ((GetCurrentEditorType() == "textmail") ? plainPart : htmlPart);
        }

        return hybridString;
    },

    dump : function(str)
    {
        var csClass = Components.classes['@mozilla.org/consoleservice;1'];
        var cs = csClass.getService(Components.interfaces.nsIConsoleService);

        cs.logStringMessage((new Date()).getTime() + ": " + str);
    },

    convertFileURIsToDataURIs : function(content)
    {
        return content.replace(/file:\/\/[^"' >]+/gi, function(match)
        {
            try
            {
                var convertedContent = ss_main.getFileAsDataURI(match);
                return convertedContent;
            }
            catch (ex)
            {
                return match;
            }
        });
    },

    getFileAsDataURI : function(aURL)
    {
        var filename = aURL.substr(aURL.lastIndexOf("/") + 1);
        filename = decodeURIComponent(filename);

        var url = Services.io.newURI(aURL, null, null);
        var contentType = Components.classes["@mozilla.org/mime;1"].getService(Components.interfaces.nsIMIMEService).getTypeFromURI(url);

        if (!contentType.startsWith("image/")) {
            // non-image content-type; let Thunderbird show a warning after insertion
            return aURL;
        }

        url = url.QueryInterface(Components.interfaces.nsIURL);

        var channel = Services.io.newChannelFromURI2(url, null, Services.scriptSecurityManager.getSystemPrincipal(), null, Components.interfaces.nsILoadInfo.SEC_NORMAL, Components.interfaces.nsIContentPolicy.TYPE_OTHER);

        var stream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);
        stream.setInputStream(channel.open());

        var encoded = btoa(stream.readBytes(stream.available()));

        stream.close();

        return "data:" + contentType + (filename ? ";filename=" + encodeURIComponent(filename) : "") + ";base64," + encoded;
    }
};

window.addEventListener("load", ss_main.onLoad, true);
window.addEventListener("compose-window-close", ss_main.sanitize, true);
window.addEventListener("compose-window-reopen", ss_main.init, true);
window.addEventListener("compose-from-changed", ss_main.fromChanged, true);
