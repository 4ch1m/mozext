var stringbundle = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle("chrome://signatureswitch/locale/signatureswitch.properties");

var availableMailinglists;

function onLoad()
{
    document.addEventListener("dialogaccept", function() {
        onDialogAccept();
    });

    var item = window.arguments[0];

    if (item)
    {
        var shortCutKeyItem = document.createElement("menuitem");
        shortCutKeyItem.setAttribute("label", item.shortcut.charAt(0));

        insertMenuItemBeforeFirstSeparator(document.getElementById("shortcut_key"), shortCutKeyItem);

        document.getElementById("path").value = item.path;
        document.getElementById("description").value = item.description;
        document.getElementById("shortcut_key").selectedIndex = 0;
        document.getElementById("shortcut_modifier_accel").checked = (item.shortcut.charAt(1) == "X");
        document.getElementById("shortcut_modifier_alt").checked = (item.shortcut.charAt(2) == "X");
        document.getElementById("shortcut_modifier_control").checked = (item.shortcut.charAt(3) == "X");
        document.getElementById("shortcut_modifier_meta").checked = (item.shortcut.charAt(4) == "X");
        document.getElementById("shortcut_modifier_shift").checked = (item.shortcut.charAt(5) == "X");

        fillListboxFromArray(document.getElementById("addresses"), item.addresses.split(";"));
        fillListboxFromArray(document.getElementById("newsgroups"), item.newsgroups.split(";"));
        fillListboxFromArray(document.getElementById("mailinglists"), item.mailinglists.split(";"));
    }

    availableMailinglists = obtainMailinglists();

    if (availableMailinglists.length < 1)
        document.getElementById("pickMailinglist").disabled;
}

function onDialogAccept()
{
    var isValid = false;

    try
    {
        isValid = checkDescription() && checkPath();

        var item = window.arguments[0];

        if (isValid && item)
        {
            item.description = document.getElementById("description").value;
            item.path = document.getElementById("path").value;

            var shortcutKey = document.getElementById("shortcut_key").selectedItem.label;

            var shortcut;

            shortcut = shortcutKey === undefined ? " " : shortcutKey;
            shortcut = shortcut + ((document.getElementById("shortcut_modifier_accel").checked) ? "X" : "-");
            shortcut = shortcut + ((document.getElementById("shortcut_modifier_alt").checked) ? "X" : "-");
            shortcut = shortcut + ((document.getElementById("shortcut_modifier_control").checked) ? "X" : "-");
            shortcut = shortcut + ((document.getElementById("shortcut_modifier_meta").checked) ? "X" : "-");
            shortcut = shortcut + ((document.getElementById("shortcut_modifier_shift").checked) ? "X" : "-");

            if (item.shortcut != shortcut)
                alert(getLocalizedMessage("alert.keyBindings"));

            item.shortcut = shortcut;
            item.addresses = getArrayFromListbox(document.getElementById("addresses"));
            item.newsgroups = getArrayFromListbox(document.getElementById("newsgroups"));
            item.mailinglists = getArrayFromListbox(document.getElementById("mailinglists"));
        }
    }
    catch (err)
    {
        alert(err);
    }

    return isValid;
}

function onDialogCancel()
{
}

function onPickSignature()
{
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window, getLocalizedMessage("setSignature.setSignatureTitle"), Components.interfaces.nsIFilePicker.modeOpen);
    fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);
    fp.open(function(returnValue){
        if (returnValue == Components.interfaces.nsIFilePicker.returnOK)
            document.getElementById("path").value = fp.file.path;
    });
}

function onComposeSignature()
{
    var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

    var composerPath = pref.getStringPref("extensions.signatureswitch.composerpath");
    var sigPath = replaceDirectoryVariable(document.getElementById("path").value);

    var sig = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
    sig.initWithPath(sigPath);

    var composer = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
    composer.initWithPath(composerPath);

    if (!composer.exists())
    {
        alert(getLocalizedMessage("options.composerNotFound"));
        return false;
    }

    // this one is making trouble on Mac *sigh* ...
    //if (!composer.isExecutable())
    //    return false;

    var composerArgs = [sigPath];

    if (!sig.exists())
    {
        var params = {inn:{sigPath:sigPath}, out:null};
        window.openDialog("chrome://signatureswitch/content/create.xul", "", "chrome, dialog, modal, resizable=yes", params).focus();

        if (!params.out)
           return false;

        var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
        foStream.init(sig, 0x02 | 0x08 | 0x20, 0666, 0);
        foStream.write("", 0);
        foStream.close();
    }

    var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
    process.init(composer);
    process.run(false, composerArgs, composerArgs.length);
}

function onPickMailinglist()
{
    var params = {mailinglists:availableMailinglists, selection:null};

    window.openDialog("chrome://signatureswitch/content/mailinglist.xul", "", "chrome, dialog, modal, resizable=yes", params).focus();

    if (params.selection)
       document.getElementById("mailinglist").value = params.selection;
}

function checkDescription()
{
    var description = document.getElementById("description");
    var isValid;

    if (description.value == "" || description.value.indexOf("*") > -1 || description.value.indexOf("|") > -1)
        isValid = false;
    else
        isValid = true;

    if (!isValid)
    {
        alert(getLocalizedMessage("setSignature.invalidDescription"));
        description.focus();
    }

    return isValid;
}

function checkPath()
{
    var path = document.getElementById("path");
    var isValid;

    if (path.value == "" || path.value.indexOf("*") > -1 || path.value.indexOf("|") > -1)
        isValid = false;
    else
        isValid = true;

    if (!isValid)
    {
        alert(getLocalizedMessage("setSignature.invalidPath"));
        path.focus();
    }

    return isValid;
}

function replaceDirectoryVariable(path)
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
}

function fillListboxFromArray(listbox, array)
{
    for (var i = 0; i < array.length; i++)
    {
        if (array[i] != "-")
            listbox.appendItem(array[i], array[i]);
    }
}

function getArrayFromListbox(listbox)
{
    var array = new Array();

    if (listbox.getRowCount() > 0)
    {
        for (var i = 0; i < listbox.getRowCount(); i++)
        {
            array.push(listbox.getItemAtIndex(i).value);
        }

        array = array.join(";");
    }
    else
    {
       array = "-";
    }

    return array;
}

function getLocalizedMessage(msg)
{
    return stringbundle.GetStringFromName(msg);
}

function addAutoSwitch(type)
{
    var input;
    var listbox;

    var msgInvalid;
    var msgDuplicate;

    switch (type)
    {
        case "address":
           input = document.getElementById("address");
           listbox = document.getElementById("addresses");
           msgInvalid = getLocalizedMessage("setSignature.invalidAddress");
           msgDuplicate = getLocalizedMessage("setSignature.duplicateAddress");
           break;
        case "newsgroup":
           input = document.getElementById("newsgroup");
           listbox = document.getElementById("newsgroups");
           msgInvalid = getLocalizedMessage("setSignature.invalidNewsgroup");
           msgDuplicate = getLocalizedMessage("setSignature.duplicateNewsgroup");
           break;
        case "mailinglist":
           input = document.getElementById("mailinglist");
           listbox = document.getElementById("mailinglists");
           msgInvalid = getLocalizedMessage("setSignature.invalidMailinglist");
           msgDuplicate = getLocalizedMessage("setSignature.duplicateMailinglist");
           break;
    }

    if (!validateAutoswitch(input.value, type))
    {
        alert(msgInvalid);
        return;
    }

    for (var i = 0; i < listbox.getRowCount(); i++)
    {
        if (listbox.getItemAtIndex(i).value == input.value)
        {
            alert(msgDuplicate);
            return;
        }
    }

    listbox.appendItem(input.value, input.value);
    listbox.ensureIndexIsVisible(listbox.getRowCount()-1);
    input.value = "";
}

function removeAutoswitch(type)
{
    var listbox;
    var selected;

    switch (type)
    {
        case "address":
           listbox = document.getElementById("addresses");
           break;
        case "newsgroup":
           listbox = document.getElementById("newsgroups");
           break;
        case "mailinglist":
           listbox = document.getElementById("mailinglists");
           break;
    }

    selected = listbox.selectedItem;

    if (selected)
        selected.remove();
}

function validateAutoswitch(input, type)
{
    if (type == "mailinglist")
        return true; // really don't validate mailinglists?

    if (input.indexOf("?") > -1)
    {
        if (input.charAt(0) == "?")
            input = "X" + input;

        if ( input.charAt(input.length - 2) == "." &&
             input.charAt(input.length - 1) == "?" )
            input += "X";

        input = input.split("?").join("X");
    }

    var rx = null;

    if (type == "address")
    {
        var rx_user = "([a-zA-Z0-9][a-zA-Z0-9_.-]*|\"([^\\\\\x80-\xff\015\012\"]|\\\\[^\x80-\xff])+\")";
        var rx_domain = "([a-zA-Z0-9][a-zA-Z0-9._-]*\\.)*[a-zA-Z0-9][a-zA-Z0-9._-]*\\.[a-zA-Z]{2,5}";

        rx = "^" + rx_user + "\@" + rx_domain + "$";
    }
    else
    {
        rx = "[a-zA-Z0-9][a-zA-Z0-9_.-]*";
    }

    var validate = new RegExp(rx);

    return validate.test(input);
}

function obtainMailinglists()
{
    var abRdf = Components.classes["@mozilla.org/rdf/rdf-service;1"].getService(Components.interfaces.nsIRDFService);
    var abRootDir = abRdf.GetResource("moz-abdirectory://").QueryInterface(Components.interfaces.nsIAbDirectory);
    var abSubDirs = abRootDir.childNodes.QueryInterface(Components.interfaces.nsISimpleEnumerator);

    var mailLists = new Array();

    var abDir;
    var abCardsEnumerator;
    var abCard;

    var continueSearch;

    while (abSubDirs.hasMoreElements())
    {
        abDir = abSubDirs.getNext().QueryInterface(Components.interfaces.nsIAbDirectory);
        abCardsEnumerator = abDir.childCards;

        continueSearch = true;

        try
        {
            abCardsEnumerator.first();
        }
        catch (ex)
        {
            continueSearch = false;
        }

        while (continueSearch)
        {
            abCard = abCardsEnumerator.currentItem();
            abCard = abCard.QueryInterface(Components.interfaces.nsIAbCard);

            if (abCard)
            {
                if (abCard.isMailList)
                   mailLists.push(abCard.displayName);
            }

            try
            {
                abCardsEnumerator.next();
            }
            catch (ex)
            {
                continueSearch = false;
            }
        }
    }

    return mailLists.reverse();
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
