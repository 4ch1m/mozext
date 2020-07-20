var slif_pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.savelinkinfolder.");
var slif_prompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);

function slifDialog()
{
   if (slif_pref.getBoolPref("hideunknowncontenttype"))
   {
      document.getElementById("slif_box").hidden = true;
      return;
   }

   if (slif_pref.getBoolPref("unknowncontenttypeselected"))
      document.getElementById("mode").selectedItem = document.getElementById("slif_radio");

   slifDialog = this;

   slifDialog.init();
}

slifDialog.prototype = {

        init : function()
        {
           slifDialog.initMenuPopup();
           document.documentElement.setAttribute("ondialogaccept", "if (slifDialog.dialogAccepted()) { " + document.documentElement.getAttribute("ondialogaccept") + " }");
        },

        initMenuPopup : function()
        {
           var menuPopup = document.getElementById("slif_menupopup");
           var menuList = document.getElementById("slif_menulist");

           var descriptionData = slifDialog.loadFolderData(0);
           var pathData = slifDialog.loadFolderData(1);

           var lastUsedFolder = null;

           try
           {
              lastUsedFolder = slif_pref.getComplexValue("lastusedfolder", Components.interfaces.nsISupportsString).data;
           }
           catch (e) {}

           var returnedItem = null;
           var selectedItem = null;
           var lastUsedItem = null;

           var directoryValidation;

           for (var i = 0; i < descriptionData.length; i++)
           {
              directoryValidation = slifDialog.validateDirectory(pathData[i]);

              returnedItem = slifDialog.insertMenuItem(menuPopup, descriptionData[i], pathData[i], null, !directoryValidation);

              if (directoryValidation)
              {
                 selectedItem = returnedItem;

                 if (pathData[i] == lastUsedFolder)
                    lastUsedItem = returnedItem;
              }

           }

           if (lastUsedItem)
           {
              menuList.selectedItem = lastUsedItem;
           }
           else if (selectedItem)
           {
              menuList.selectedItem = selectedItem;
           }
           else
           {
              document.getElementById("slif_radio").disabled = true;
              document.getElementById("slif_menulist").disabled = true;
           }
        },

        insertMenuItem : function(menu, label, tooltip, command, disabled)
        {
           var item = document.createElement("menuitem");

           item.setAttribute("id", "savelinkinfolder_" + label + "_" + (new Date()).getTime());
           item.setAttribute("label", label);
           item.setAttribute("tooltiptext", tooltip);
           item.setAttribute("oncommand", command);
           item.setAttribute("disabled", disabled);

           menu.appendChild(item);

           return item;
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

           retval = slifDialog.replaceIt(retval, "%dd%", dd);
           retval = slifDialog.replaceIt(retval, "%MM%", MM);
           retval = slifDialog.replaceIt(retval, "%yyyy%", yyyy);
           retval = slifDialog.replaceIt(retval, "%hh%", hh);
           retval = slifDialog.replaceIt(retval, "%mm%", mm);
           retval = slifDialog.replaceIt(retval, "%ss%", ss);

           var url = document.getElementById("source").getAttribute("tooltiptext");
           var title = ""; // toDo
           var domain = "";

           url = unescape(url.substr(url.indexOf("//") + 2));
           domain = url.substr(0, url.indexOf("/"));

           url = slifDialog.getPortableFileName(url);
           title = slifDialog.getPortableFileName(title);

           retval = slifDialog.replaceIt(retval, "%url%", url);
           retval = slifDialog.replaceIt(retval, "%title%", title);
           retval = slifDialog.replaceIt(retval, "%domain%", domain);

           var guid = slifDialog.generateGuid();
           retval = slifDialog.replaceIt(retval, "%guid%", guid);

           var random = slifDialog.generateRandomString(parseInt(slif_pref.getComplexValue("randomstring-length", Components.interfaces.nsISupportsString).data));
           retval = slifDialog.replaceIt(retval, "%random%", random);

           var clipboard = slifDialog.getStringFromClipboard();

           if (clipboard)
               retval = slifDialog.replaceIt(retval, "%clipboard%", slifDialog.getPortableFileName(clipboard));
           else
               retval = slifDialog.replaceIt(retval, "%clipboard%", "empty"); // todo

           return retval;
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

        openSaveAsDialog : function(fileObject, filePath, fileName)
        {
           var oldExtension = fileName.substring(fileName.lastIndexOf(".") + 1);
           var newExtension;

           try
           {
              fileObject.initWithPath(filePath);

              var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);

              fp.init(window, slifDialog.getLocalizedMessage("saveDialogTitle"), Components.interfaces.nsIFilePicker.modeSave);
              fp.appendFilters(Components.interfaces.nsIFilePicker.filterAll);
              fp.defaultString = fileName;
              fp.displayDirectory = fileObject;

              var res = fp.show();

              if ((res == Components.interfaces.nsIFilePicker.returnOK) || (res == Components.interfaces.nsIFilePicker.returnReplace))
              {
                 fileName = fp.file.leafName;
                 filePath = fp.file.path.substring(0, fp.file.path.length - fileName.length);

                 newExtension = fileName.substring(fileName.lastIndexOf(".") + 1);

                 if (newExtension != oldExtension)
                    fileName = fileName + "." + oldExtension;
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
                 args[i] = slifDialog.replaceIt(args[i], "%path%", fol);
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
              slifDialog.promptAlert(slifDialog.getLocalizedMessage("badApp.title"));
           }
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

           return str.data.substring(0,strLength.value / 2);
        },

        getLocalizedMessage : function(msg)
        {
           return document.getElementById("strings").getString(msg);
        },

        getPortableFileName : function(fileName)
        {
           return fileName.replace(/[\\\/\:\*\?\"\<\>\| ]+/g, "_");
        },

        promptAlert : function(msg)
        {
           return slif_prompt.alert(window, "Save Link in Folder", msg);
        },

        dialogAccepted : function()
        {
           var slif_selected = (document.getElementById("mode").selectedItem == document.getElementById("slif_radio"));

           slif_pref.setBoolPref("unknowncontenttypeselected", slif_selected);

           if (slif_selected)
           {
              try
               {
                  var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);

                  var idx = document.getElementById("slif_menulist").selectedIndex;
                  var folder = slifDialog.loadFolderData(1)[idx];

                  var fileObject = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);

                  var fname = document.getElementById("location").getAttribute("realname");
                  var name = fname.substring(0,fname.lastIndexOf("."));
                  var ext = fname.substring(fname.lastIndexOf(".") + 1);

                  // caution: keep order for backwards-compatibility!
                  var opensaveasdialog = (slifDialog.loadFolderData(2)[idx] == "X") ? true : false;
                  var openfolder = (slifDialog.loadFolderData(3)[idx] == "X") ? true : false;
                  var fileprefix = (slifDialog.loadFolderData(4)[idx] == "X") ? true : false;
                  var fileprefixvalue = slifDialog.loadFolderData(5)[idx];
                  var filesuffix = (slifDialog.loadFolderData(6)[idx] == "X") ? true : false;
                  var filesuffixvalue = slifDialog.loadFolderData(7)[idx];
                  var duplicatefilename = parseInt(slifDialog.loadFolderData(8)[idx]);
                  var filename = (slifDialog.loadFolderData(9)[idx] == "X") ? true : false;
                  var filenamevalue = slifDialog.loadFolderData(10)[idx];

                  // legacy support
                  if (isNaN(duplicatefilename))
                     duplicatefilename = (slifDialog.loadFolderData(8)[idx] == "X") ? 3 : 0;

                  var executable = slif_pref.getBoolPref("executable");
                  var executable_path = slif_pref.getComplexValue("executable-path", Components.interfaces.nsISupportsString).data;
                  var executable_arguments = slif_pref.getComplexValue("executable-arguments", Components.interfaces.nsISupportsString).data;

                  var prefs_dir = slif_pref.getBoolPref("prefs-dir");
                  var prefs_downloaddir = slif_pref.getBoolPref("prefs-downloadDir");
                  var prefs_lastdir = slif_pref.getBoolPref("prefs-lastDir");
                  var prefs_defaultfolder = slif_pref.getBoolPref("prefs-defaultFolder");
               }
               catch (e)
               {
                  return false;
               }

               str.data = folder;

               slif_pref.setComplexValue("lastusedfolder", Components.interfaces.nsISupportsString, str);

               if (filename || fileprefix || filesuffix)
               {
                  if (filename)
                     name = filenamevalue;

                  if (fileprefix)
                     name = fileprefixvalue + name;

                  if (filesuffix)
                     name = name + filesuffixvalue;

                  fname = name + "." + ext;

                  fname = slifDialog.variableReplace(fname);
               }

               if (opensaveasdialog)
               {
                  var newLocation = slifDialog.openSaveAsDialog(fileObject, folder, fname);

                  if (newLocation[0] == null || newLocation[1] == null)
                     return false;

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
                        var newLocation = slifDialog.openSaveAsDialog(fileObject, folder, fname);
                        if (newLocation[0] == null || newLocation[1] == null) return false;
                        folder = newLocation[0];
                        fname = newLocation[1];
                        fileObject.initWithPath(folder);
                        fileObject.append(fname);
                        break;

                     case 1:
                        fileObject.createUnique(0, 0777);
                        break;

                     case 2:
                        return false;

                     case 3:
                        fileObject.remove(true);
                        break;
                   }
               }

               dialog.mLauncher.setWebProgressListener(null);
               dialog.mLauncher.saveToDisk(fileObject, false);

               if (openfolder)
               {
                  if (executable)
                  {
                     slifDialog.openFolderWithExecutable(executable_path, executable_arguments, folder);
                  }
                  else
                  {
                	 try
                	 {
                        folderObject.initWithPath(folder);
                        folderObject.launch();
                	 }
                	 catch (e) {} // FF4.0 throws exception upon launch()
                  }
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

               dialog.mDialog.dialog = null;

               return false;
           }

           return true;
        }
};

window.addEventListener("load", function() { new slifDialog(); }, false);
