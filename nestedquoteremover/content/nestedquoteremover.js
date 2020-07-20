var nqr_initStatus = false;
var nqr_quoteDepth = null;
var nqr_nodeArray = new Array();

var nqr_main = {

    nestedQuoteRemover : function()
    {
        try
        {
            var prefsService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.nestedquoteremover.");

            nqr_quoteDepth = parseInt(prefsService.getCharPref("quotedepth"));

            if (nqr_quoteDepth < 1)
                nqr_quoteDepth = 1;
        }
        catch (e)
        {
            nqr_quoteDepth = 1;
        }

        var currentEditor = GetCurrentEditor();
        var currentEditorDom = currentEditor.rootElement;
        var currentEditorDomChilds = currentEditorDom.childNodes;

        var quotePattern = ">";

        var i = 0;

        do
        {
            quotePattern += ">";
        }
        while (++i < nqr_quoteDepth);

        currentEditor.beginTransaction();

        if (GetCurrentEditorType() != "textmail")
        {
            nqr_main.removeQuotesHtml(currentEditor, currentEditorDomChilds);
        }
        else
        {
            nqr_main.removeQuotesText(currentEditor, currentEditorDomChilds, quotePattern);
        }

        currentEditor.endTransaction();
    },

    removeQuotesText : function(editor, nodes, pattern)
    {
        var node;
        var nodeSibling;
        
        for (var i = (nodes.length - 1); i >= 0; i--)
        {
            node = nodes[i];
            nodeSibling = node.nextSibling;
            
            if (node.hasChildNodes())
            {
                nqr_main.removeQuotesText(editor, node.childNodes, pattern);
            }
            else
            {
                try
                {
                    if (node.nodeValue.toString().substr(0, nqr_quoteDepth + 1) == pattern)
                    {
                        editor.deleteNode(node);
                        
                        if (nodeSibling && nodeSibling.nodeName == "BR")
                           editor.deleteNode(nodeSibling);
                    }
                }
                catch (e) {}
            }
        }
    },

    removeQuotesHtml : function(editor, nodes)
    {
        nqr_nodeArray = new Array();

        nqr_main.searchBlockQuote(nodes, 0);

        while (nqr_nodeArray.length > 0)
        {
            editor.deleteNode(nqr_nodeArray.pop());
        }
    },

    searchBlockQuote : function(nodes, quoteLevel)
    {
        var node;
        
        for (var i = 0; i < nodes.length; i++)
        {
            node = nodes[i];
            
            if (node.nodeName == "BLOCKQUOTE")
            {
                if (quoteLevel == nqr_quoteDepth)
                    nqr_nodeArray.push(node);
                else
                    nqr_main.searchBlockQuote(node.childNodes, quoteLevel + 1);
            }
            else
            {
                if (node.hasChildNodes())
                    nqr_main.searchBlockQuote(node.childNodes, quoteLevel);
            }
       }
    },

    clearGlobals : function()
    {
        nqr_initStatus = false;
        nqr_quoteDepth = null;
        nqr_nodeArray = new Array();
    },

    init : function()
    {
        if (nqr_initStatus)
            return;

        nqr_initStatus = true;

        var shortcut_key;
        var shortcut_modifier_accel;
        var shortcut_modifier_alt;
        var shortcut_modifier_control;
        var shortcut_modifier_meta;
        var shortcut_modifier_shift;

        var autoremove;
        var contextmenu;

        try
        {
            var prefsService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.nestedquoteremover.");

            shortcut_key              = prefsService.getCharPref("shortcut_key");
            shortcut_modifier_accel   = prefsService.getBoolPref("shortcut_modifier_accel");
            shortcut_modifier_alt     = prefsService.getBoolPref("shortcut_modifier_alt");
            shortcut_modifier_control = prefsService.getBoolPref("shortcut_modifier_control");
            shortcut_modifier_meta    = prefsService.getBoolPref("shortcut_modifier_meta");
            shortcut_modifier_shift   = prefsService.getBoolPref("shortcut_modifier_shift");

            autoremove = prefsService.getBoolPref("autoremove");
            contextmenu = prefsService.getBoolPref("contextmenu");
        }
        catch (e)
        {
            shortcut_key = "Y";
            shortcut_modifier_accel = false;
            shortcut_modifier_alt = false;
            shortcut_modifier_control = true;
            shortcut_modifier_meta = false;
            shortcut_modifier_shift = true;

            autoremove = false;
            contextmenu = true;
        }

        var shortcut_modifier = new Array();

        if (shortcut_modifier_accel)
            shortcut_modifier.push("accel");
        if (shortcut_modifier_alt)
            shortcut_modifier.push("alt");
        if (shortcut_modifier_control)
            shortcut_modifier.push("control");
        if (shortcut_modifier_meta)
            shortcut_modifier.push("meta");
        if (shortcut_modifier_shift)
            shortcut_modifier.push("shift");

        var shortcut = document.getElementById("NestedQuoteRemoverKey");

        shortcut.setAttribute("key", shortcut_key);
        shortcut.setAttribute("modifiers", shortcut_modifier.join(","));

        var ctxmenu = document.getElementById("NestedQuoteRemoverContext");

        ctxmenu.setAttribute("hidden", !contextmenu);

        if (autoremove)
            setTimeout("nqr_main.nestedQuoteRemover()", 1000);
    },

    openOptions : function(autosave)
    {
        return window.openDialog("chrome://nestedquoteremover/content/options.xul", "_blank", "chrome, modal, resizable=yes", autosave);
    },

    dump : function(str)
    {
        var csClass = Components.classes['@mozilla.org/consoleservice;1'];
        var cs = csClass.getService(Components.interfaces.nsIConsoleService);

        cs.logStringMessage((new Date()).getTime() + ": " + str);
    }
};

window.addEventListener("load", nqr_main.init, true);
window.addEventListener("compose-window-close", nqr_main.clearGlobals, true);
window.addEventListener("compose-window-reopen", nqr_main.init, true);
