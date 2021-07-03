let ready = (callback) => {
    if (document.readyState != "loading") callback();
    else document.addEventListener("DOMContentLoaded", callback);
}

ready(() => {
    dataI18n();

    // initially check if a signature is already present
    browser.runtime.sendMessage({ type: "isSignaturePresent" }).then(response => {
        // on/off button ...
        document.getElementById("onOffButtonContainer").innerHTML = Mustache.render(ON_OFF_BUTTON, {
            class: response.result ? "btn-danger" : "btn-success",
            image: response.result ? "toggle-off" : "toggle-on",
            text: response.result ? i18n("composeSwitchOff") : i18n("composeSwitchOn")
        });
        document.getElementById("onOffButton").addEventListener("click", () => {
            browser.runtime.sendMessage({
                type: "switchSignature",
                value: response.result ? "off" : "on"
            });
            window.close();
        });
        browser.storage.local.get().then(localStorage => {
            if (!localStorage.signatures || localStorage.signatures.length === 0) {
                document.getElementById("onOffButton").classList.add("disabled");
            }
        });
        // signature-buttons ...
        browser.storage.local.get().then(localStorage => {
            if (localStorage.signatures) {
                let signatureIds = [];

                // create buttons
                localStorage.signatures.forEach(signature => {
                    signatureIds.push(signature.id);
                    let button = document.createElement("span");
                    button.innerHTML = Mustache.render(SIGNATURE_BUTTON, {
                        id: signature.id,
                        name: truncateString(signature.name)
                    });
                    document.getElementById("signatureButtonsContainer").appendChild(button);
                });

                // add event-listeners for buttons
                signatureIds.forEach(signatureId => {
                    document.getElementById("signatureButton-" + signatureId).addEventListener("click", () => {
                        browser.runtime.sendMessage({
                            type: "insertSignature",
                            value: signatureId
                        });
                        window.close();
                    });
                });
            }
        });
    });

    // options-button ...
    document.getElementById("optionsButton").addEventListener("click", () => {
        openOptions(() => {
            browser.runtime.sendMessage({type: "focusOptionsWindow", value: optionsWindowId});
            window.close();
        });
    });
});
