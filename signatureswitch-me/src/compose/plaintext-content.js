function messageReceived(message, sender) {
    if (message.action === "setSignature") {
        let sigdiv = document.querySelector("div.moz-signature");
        if (message.data) {
            if (!sigdiv) {
                sigdiv = document.createElement("div");
                sigdiv.className = "moz-signature";
                document.body.appendChild(sigdiv);

                let br = document.createElement("br");
                br.setAttribute("_moz_dirty", "");
                document.body.appendChild(br);

                if (document.body.children.length === 2) {
                    let br = document.createElement("br");
                    br.setAttribute("_moz_dirty", "");
                    document.body.insertBefore(br, sigdiv);
                }
            }

            let signature = message.data;
            signature = signature.replaceAll("\n", '<br _moz_dirty="">');
            sigdiv.innerHTML = signature;
        } else {
            if (sigdiv) {
                while (document.body.lastChild !== sigdiv) {
                    document.body.removeChild(document.body.lastChild);
                }
                document.body.removeChild(sigdiv);
            }
        }
    }
}

browser.runtime.onMessage.addListener(messageReceived);
