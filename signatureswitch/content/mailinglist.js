function onDialogLoad()
{
    document.addEventListener("dialogaccept", function() {
        onDialogAccept();
    });

    var listbox = document.getElementById("mailinglists");
    var mailinglists = window.arguments[0].mailinglists;

    for (var i = 0; i < mailinglists.length; i++)
    {
        listbox.appendItem(mailinglists[i], mailinglists[i]);
    }
}

function onDialogAccept()
{
    var listbox = document.getElementById("mailinglists");
    var selected = listbox.selectedIndex;

    if (selected >= 0)
        window.arguments[0].selection = listbox.getItemAtIndex(selected).value;
}
