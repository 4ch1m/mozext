var pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

var elementIDs = [ "quotedepth",
                   "shortcut_key",
                   "shortcut_modifier_accel",
                   "shortcut_modifier_alt",
                   "shortcut_modifier_control",
                   "shortcut_modifier_meta",
                   "shortcut_modifier_shift",
                   "autoremove",
                   "contextmenu" ];

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

    if (window.arguments && window.arguments[0])
        document.documentElement.acceptDialog();
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
            pref.setIntPref(element.getAttribute("prefstring"), parseInt(element.value));
        else if  (eltType == "checkbox")
            pref.setBoolPref(element.getAttribute("prefstring"), element.checked);
        else if  (eltType == "textbox" && element.preftype == "int")
            pref.setIntPref(element.getAttribute("prefstring"), parseInt(element.getAttribute("value")));
        else if  (eltType == "textbox")
            pref.setCharPref(element.getAttribute("prefstring"), element.value);
        else if  (eltType == "menulist")
            pref.setCharPref(element.getAttribute("prefstring"), element.selectedItem.label);
    }
}

function moreQuoteDepth()
{
    var quotedepth = document.getElementById("quotedepth");
    var qd = parseInt(quotedepth.value);

    qd ++;

    quotedepth.setAttribute("value", qd);
}

function lessQuoteDepth()
{
    var quotedepth = document.getElementById("quotedepth");
    var qd = parseInt(quotedepth.value);

    if (qd > 1)
        qd --;

    quotedepth.setAttribute("value", qd);
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
