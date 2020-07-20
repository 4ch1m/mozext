var nme_prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.newmailexecute.");

var nme_previousTrigger;
var nme_interval;
var nme_observedFolders = new Array();

var nme_main = {

    init : function()
    {
        Components.classes[mailSessionContractID]
                  .getService(Components.interfaces.nsIMsgMailSession)
                  .AddFolderListener(new nme_folderListener(), Components.interfaces.nsIFolderListener.intPropertyChanged | Components.interfaces.nsIFolderListener.event);
    },

    observeFolders : function()
    {
        if (nme_observedFolders.length == 0)
        {
            clearInterval(nme_interval);
            return;
        }

        var x;

        for (x in nme_observedFolders)
        {
            var folder = nme_observedFolders[x];

            if (!folder.locked)
            {
                nme_main.removeObservation(folder);

                try
                {
                    var path = nme_prefs.getComplexValue("path", Components.interfaces.nsISupportsString).data;
                    var args = nme_prefs.getComplexValue("arguments", Components.interfaces.nsISupportsString).data.split(" ");

                    path = nme_main.replaceDirectoryVariable(path);

                    for (var i=0; i < args.length; ++i)
                    {
                        if (args[i].indexOf("%folder%") > -1)
                            args[i] = nme_main.replaceString(args[i], "%folder%", folder.name);
                    }

                    var executableObject = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                    var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);

                    executableObject.initWithPath(path);

                    if (executableObject.exists())
                    {
                        if (executableObject.isExecutable())
                        {
                            process.init(executableObject);
                            process.run(false, args, args.length);
                        }
                    }
                }
                catch (e) {}
            }
        }
    },

    addObservation : function(folder)
    {
        var x;

        for (x in nme_observedFolders)
        {
            if (nme_observedFolders[x] == folder)
                return;
        }

        nme_observedFolders.push(folder);
    },

    removeObservation : function(folder)
    {
        if (nme_observedFolders.length > 1)
        {
            var x;

            for (x in nme_observedFolders)
            {
                if (nme_observedFolders[x] == folder)
                {
                    nme_observedFolders.splice(x, 1);
                    return;
                }
            }
        }
        else
        {
            nme_observedFolders = new Array();
        }
    },

    replaceString : function(inval, search, replace)
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
    }
};

function nme_folderListener() {}

nme_folderListener.prototype =
{
    OnItemIntPropertyChanged: function(item, property, valueOld, valueNew)
    {
        var folder = item.QueryInterface(Components.interfaces.nsIMsgFolder);

        if ( property.toString() == "TotalMessages" && valueNew > valueOld && folder.hasNewMessages )
        {
            const MSG_FOLDER_FLAG_INBOX     = 0x1000;
            const MSG_FOLDER_FLAG_VIRTUAL   = 0x0020;
            const MSG_FOLDER_FLAG_TRASH     = 0x0100;
            const MSG_FOLDER_FLAG_SENTMAIL  = 0x0200;
            const MSG_FOLDER_FLAG_DRAFTS    = 0x0400;
            const MSG_FOLDER_FLAG_QUEUE     = 0x0800;
            const MSG_FOLDER_FLAG_TEMPLATES = 0x400000;
            const MSG_FOLDER_FLAG_JUNK      = 0x40000000;

            if ( folder.flags & MSG_FOLDER_FLAG_VIRTUAL   ||
                 folder.flags & MSG_FOLDER_FLAG_TRASH     ||
                 folder.flags & MSG_FOLDER_FLAG_SENTMAIL  ||
                 folder.flags & MSG_FOLDER_FLAG_DRAFTS    ||
                 folder.flags & MSG_FOLDER_FLAG_QUEUE     ||
                 folder.flags & MSG_FOLDER_FLAG_TEMPLATES ||
                 folder.flags & MSG_FOLDER_FLAG_JUNK )
                return;

            var currentTrigger = folder.folderURL + valueNew;

            if (currentTrigger != nme_previousTrigger)
            {
               nme_previousTrigger = currentTrigger;
               nme_main.addObservation(folder);
               nme_interval = setInterval("nme_main.observeFolders()", 500);
            }
        }
    },

    OnItemEvent: function(item, event) {}
}

addEventListener("load", nme_main.init, true);
