function onDialogLoad()
{
   document.addEventListener("dialogaccept", function() {
      onDialogAccept();
   });

   document.getElementById("desc2").value = window.arguments[0].inn.sigPath;
}

function onDialogAccept()
{
   window.arguments[0].out = true;
}
