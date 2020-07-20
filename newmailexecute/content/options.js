var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);

var elementIDs = ["path", "arguments"];

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

        if  (!element) break;

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
}

function onDialogCancel()
{
}

function onPickExecutable()
{
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window, getLocalizedMessage("options.pickExecutableTitle"), Components.interfaces.nsIFilePicker.modeOpen);
    fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);

    var res = fp.show();

    if (res == Components.interfaces.nsIFilePicker.returnOK)
        document.getElementById("path").value = fp.file.path;

    return true;
}

function getLocalizedMessage(msg)
{
    return document.getElementById("newmailexecute.locale").getString(msg);
}
