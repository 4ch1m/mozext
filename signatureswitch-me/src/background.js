const xmlSerializer = new XMLSerializer();
const domParser = new DOMParser();

const PLAINTEXT_SIGNATURE_SEPARATOR = "-- \n";
const HTML_SIGNATURE_CLASS = "moz-signature";

let browserWindowId;
let composeTabId;
let foundSignatureId;

/* =====================================================================================================================
   init ...
 */

(() => {
    browser.windows.getCurrent().then(window => {
        browserWindowId = window.id;
    });

    createContextMenu();

    addStorageChangeListener();
    addCommandListener();
    addMessageListener();
    addComposeActionListener();
})();

/* =====================================================================================================================
   context-menu ...
 */

function createContextMenu() {
    const ROOT_MENU = "signature_switch";

    browser.menus.remove(ROOT_MENU);

    browser.storage.local.get().then(localStorage => {
        const SUB_MENU_PREFIX = ROOT_MENU + "_";
        const menuItems = [];

        menuItems.push({
            id: ROOT_MENU,
            title: browser.i18n.getMessage("extensionName"),
            contexts: [
                "editable"
            ]
        });

        menuItems.push({
            // TODO
            parentId: ROOT_MENU,
            title: "ON/OFF"
        });

        menuItems.push({
            parentId: ROOT_MENU,
            type: "separator"
        });

        if (localStorage.signatures) {
            localStorage.signatures.forEach(signature => {
                menuItems.push({
                    id: SUB_MENU_PREFIX + signature.id,
                    title: truncateString(signature.name, 20),
                    parentId: ROOT_MENU
                });
            });

            menuItems.push({
                parentId: ROOT_MENU,
                type: "separator"
            });

            menuItems.push({
                parentId: ROOT_MENU,
                title: "Options"
            });

            createMenuItems(menuItems);
        }
    });
}

function createMenuItems(items) {
    if (typeof items !== "undefined" && items.length > 0) {
        browser.menus.create(items.pop(), createMenuItems(items));
    }
}

/* =====================================================================================================================
   listeners ...
 */

function addStorageChangeListener() {
    browser.storage.onChanged.addListener((changes) => {
        createContextMenu();

        let changedItems = Object.keys(changes);

        for (let item of changedItems) {
            // TODO
            if (item === "???") {
            }
        }
    });
}

function addCommandListener() {
    browser.commands.onCommand.addListener((name) => {
        switch (name) {
            case "switch":
                // TODO
                console.log("!!! switch");
                break;
            case "next":
                // TODO
                console.log("!!! next");
                break;
            case "previous":
                // TODO
                console.log("!!! previous");
                break;
        }
    });
}

function addMessageListener() {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.type) {
            case "getBrowserWindowId":
                sendResponse(browserWindowId);
                break;
            case "switchSignature":
                if (request.value === "on") {
                    // append default-signature ...
                    browser.storage.local.get().then(localStorage => {
                        if (localStorage.signatures && localStorage.defaultSignature) {
                            let signatures = localStorage.signatures;
                            for (let i = 0; i < signatures.length; i++) {
                                if (signatures[i].id === localStorage.defaultSignature) {
                                    appendSignatureToComposer(signatures[i].text);
                                    break;
                                }
                            }
                        }
                    });
                } else {
                    // remove signature ...
                    browser.compose.getComposeDetails(composeTabId).then(details => {
                        let newDetails = details.isPlainText ? { plainTextBody: getBodyWithoutSignature(details) } : { body: getBodyWithoutSignature(details) };
                        browser.compose.setComposeDetails(composeTabId, newDetails);
                    });
                }
                break;
            case "insertSignature":
                // append selected signature ...
                browser.storage.local.get().then(localStorage => {
                    if (localStorage.signatures) {
                        let signatures = localStorage.signatures;
                        for (let i = 0; i < signatures.length; i++) {
                            if (signatures[i].id === request.value) {
                                appendSignatureToComposer(signatures[i].text);
                                break;
                            }
                        }
                    }
                });
                break;
            case "isSignaturePresent":
                sendResponse({result: foundSignatureId !== ""});
                break;
            default:
                console.log("invalid message type!");
        }
    });
}

function addComposeActionListener() {
    browser.composeAction.onClicked.addListener(tab => {
        composeTabId = tab.id;

        searchSignatureInComposer();

        // "dirty hack" ;-)
        // (this way we can have both a popup(script) and the click-event in here)
        browser.composeAction.setPopup({popup: "compose/popup.html"});
        browser.composeAction.openPopup();
        browser.composeAction.setPopup({popup: ""});
    });
}

/* =====================================================================================================================
   composer interaction ...
 */

async function appendSignatureToComposer(text) {
    let details = await browser.compose.getComposeDetails(composeTabId);
    let cleansedBody = getBodyWithoutSignature(details);

    if (details.isPlainText) {
        cleansedBody += createPlainTextSignature(text);
        browser.compose.setComposeDetails(composeTabId, {plainTextBody: cleansedBody});
    } else {
        let document = domParser.parseFromString(cleansedBody, "text/html");
        document.body.appendChild(createHtmlSignature(document, text));

        browser.compose.setComposeDetails(composeTabId, {body: xmlSerializer.serializeToString(document)});
    }
}

async function searchSignatureInComposer() {
    foundSignatureId = "";

    let localStorage = await browser.storage.local.get();

    if (localStorage.signatures) {
        let signatures = localStorage.signatures;
        let details = await browser.compose.getComposeDetails(composeTabId);
        let bodyDocument = details.isPlainText ? undefined : domParser.parseFromString(details.body, "text/html");

        for (let i = 0; i < signatures.length; i++) {
            let signatureText = signatures[i].text;

            if (details.isPlainText) {
                if (details.plainTextBody.endsWith(createPlainTextSignature(signatureText))) {
                    foundSignatureId = signatures[i].id;
                    break;
                }
            } else {
                let htmlSignatures = bodyDocument.getElementsByClassName(HTML_SIGNATURE_CLASS);

                if (htmlSignatures && htmlSignatures.length > 0) {
                    if (htmlSignatures[htmlSignatures.length - 1].textContent === signatureText) {
                        foundSignatureId = signatures[i].id;
                        break;
                    }
                }
            }
        }
    }
}

/* =====================================================================================================================
   signature creation ...
 */

function createPlainTextSignature(text) {
    return "\n" + PLAINTEXT_SIGNATURE_SEPARATOR + text;
}

function createHtmlSignature(document, text) {
    let preElement = document.createElement("pre");
    preElement.textContent = text;
    preElement.className = HTML_SIGNATURE_CLASS;
    preElement.setAttribute("cols", "72");

    return preElement;
}

/* =====================================================================================================================
   helpers ...
 */

function getBodyWithoutSignature(composeDetails) {
    if (composeDetails.isPlainText) {
        let body = composeDetails.plainTextBody;
        let signatureIndex = body.lastIndexOf("\n" + PLAINTEXT_SIGNATURE_SEPARATOR);

        return signatureIndex > -1 ? body.substring(0, body.lastIndexOf("\n" + PLAINTEXT_SIGNATURE_SEPARATOR)) : body;
    } else {
        let document = domParser.parseFromString(composeDetails.body, "text/html");
        let signatures = document.getElementsByClassName(HTML_SIGNATURE_CLASS);

        if (signatures && signatures.length > 0) {
            signatures[signatures.length - 1].remove();
            return xmlSerializer.serializeToString(document);
        } else {
            return composeDetails.body;
        }
    }
}

function truncateString(string, length) {
    if (string.length <= length) {
        return string;
    }

    return string.slice(0, length) + "...";
}
