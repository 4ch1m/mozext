function onLoad()
{
    var item = window.arguments[0];

    if (item)
    {
        document.getElementById("path").value = item.path;
        document.getElementById("description").value = item.description;
        document.getElementById("opensaveasdialog").checked = (item.opensaveasdialog == "X");
        document.getElementById("openfolder").checked = (item.openfolder == "X");
        document.getElementById("fileprefix").checked = (item.fileprefix == "X");
        document.getElementById("fileprefixvalue").value = item.fileprefixvalue;
        document.getElementById("filename").checked = (item.filename == "X");
        document.getElementById("filenamevalue").value = item.filenamevalue;
        document.getElementById("filesuffix").checked = (item.filesuffix == "X");
        document.getElementById("filesuffixvalue").value = item.filesuffixvalue;

        var df = parseInt(item.duplicatefilename);

        // legacy support
        if (isNaN(df))
            df = (item.duplicatefilename == "X") ? 3 : 0;

        document.getElementById("duplicatefilenamevalue").selectedItem = document.getElementById("duplicatefilenamevalue").childNodes[df];
    }
}

function onDialogAccept()
{
    var isValid = false;

    try
    {
        isValid = checkDescription() && checkPath() && checkFilePrefixValue() && checkFileNameValue() && checkFileSuffixValue();

        var item = window.arguments[0];

        if (isValid && item)
        {
            item.path = document.getElementById("path").value;
            item.description = document.getElementById("description").value;
            item.opensaveasdialog = (document.getElementById("opensaveasdialog").checked) ? "X" : "-";
            item.openfolder = (document.getElementById("openfolder").checked) ? "X" : "-";
            item.fileprefix = (document.getElementById("fileprefix").checked) ? "X" : "-";
            item.fileprefixvalue = document.getElementById("fileprefixvalue").value;
            item.filename = (document.getElementById("filename").checked) ? "X" : "-";
            item.filenamevalue = document.getElementById("filenamevalue").value;
            item.filesuffix = (document.getElementById("filesuffix").checked) ? "X" : "-";
            item.filesuffixvalue = document.getElementById("filesuffixvalue").value;
            item.duplicatefilename = document.getElementById("duplicatefilenamevalue").value;
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

function onPickFolder()
{
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);

    fp.init(window, getLocalizedMessage("setFolder.pickFolderTitle"), Components.interfaces.nsIFilePicker.modeGetFolder);

    var res = fp.show();

    if (res == Components.interfaces.nsIFilePicker.returnOK)
        document.getElementById("path").value = fp.file.path;

    return true;
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
        alert(getLocalizedMessage("setFolder.invalidDescription"));
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
        alert(getLocalizedMessage("setFolder.invalidPath"));
        path.focus();
    }

    return isValid;
}

function checkFilePrefixValue()
{
    var fileprefixvalue = document.getElementById("fileprefixvalue");
    var isValid;

    if (fileprefixvalue.value.indexOf("*") > -1 || fileprefixvalue.value.indexOf("|") > -1)
        isValid = false;
    else
        isValid = true;

    if (!isValid)
    {
        alert(getLocalizedMessage("setFolder.invalidFilePrefixValue"));
        fileprefixvalue.focus();
    }

    return isValid;
}

function checkFileNameValue()
{
    var filenamevalue = document.getElementById("filenamevalue");
    var isValid;

    if (filenamevalue.value.indexOf("*") > -1 || filenamevalue.value.indexOf("|") > -1)
        isValid = false;
    else
        isValid = true;

    if (!isValid)
    {
        alert(getLocalizedMessage("setFolder.invalidFileNameValue"));
        filenamevalue.focus();
    }

    return isValid;
}

function checkFileSuffixValue()
{
    var filesuffixvalue = document.getElementById("filesuffixvalue");
    var isValid;

    if (filesuffixvalue.value.indexOf("*") > -1 || filesuffixvalue.value.indexOf("|") > -1)
        isValid = false;
    else
        isValid = true;

    if (!isValid)
    {
        alert(getLocalizedMessage("setFolder.invalidFileSuffixValue"));
        filesuffixvalue.focus();
    }

    return isValid;
}

function getLocalizedMessage(msg)
{
    return document.getElementById("saveimageinfolder.locale").getString(msg);
}
