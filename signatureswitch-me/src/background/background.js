const NEW_LINE = "\n";
const PLAINTEXT_SIGNATURE_SEPARATOR = "-- " + NEW_LINE;
const HTML_SIGNATURE_CLASS = "moz-signature";
const WINDOW_TYPE_MESSAGE_COMPOSE = "messageCompose";
const CUSTOM_SIGNATURE_ID_ATTRIBUTE = "signature-switch-id";
const REPLY_SUBJECT_PREFIX = "Re:";
const FORWARD_SUBJECT_PREFIX = "Fwd:";

const MENU_ROOT_ID = "signature_switch";
const MENU_ID_SEPARATOR = "_";
const MENU_SUBENTRY_ID_PREFIX = MENU_ROOT_ID + MENU_ID_SEPARATOR;
const MENU_ENTRY_ONOFF = "on-off";
const MENU_ENTRY_OPTIONS = "options";

const COMMAND_SWITCH = "switch";
const COMMAND_NEXT = "next";
const COMMAND_PREVIOUS = "previous";

// ---------------------------------------------------------------------------------------------------------------------

const xmlSerializer = new XMLSerializer();
const domParser = new DOMParser();

let composeActionTabId;
let composeActionSignatureId;

/* =====================================================================================================================
   init ...
 */

(() => {
    createContextMenu();

    addContextMenuListener();
    addStorageChangeListener();
    addCommandListener();
    addMessageListener();
    addBrowserActionListener();
    addComposeActionListener();
    addWindowCreateListener();
})();

/* =====================================================================================================================
   context-menu ...
 */

function createContextMenu() {
    browser.menus.remove(MENU_ROOT_ID);

    browser.storage.local.get().then(localStorage => {
        let menuItems = [];

        menuItems.push({
            id: MENU_ROOT_ID,
            title: i18n("extensionName"),
            contexts: [
                // TODO
                // the MailExtension-API lacks a suitable context-type for the composer-window;
                // so this won't work atm
                "editable"
            ]
        });

        menuItems.push({
            id: MENU_SUBENTRY_ID_PREFIX + MENU_ENTRY_ONOFF,
            parentId: MENU_ROOT_ID,
            title: i18n("menuOnOff")
        });

        menuItems.push({
            parentId: MENU_ROOT_ID,
            type: "separator"
        });

        if (localStorage.signatures) {
            localStorage.signatures.forEach(signature => {
                menuItems.push({
                    id: MENU_SUBENTRY_ID_PREFIX + signature.id,
                    title: truncateString(signature.name),
                    parentId: MENU_ROOT_ID
                });
            });

            menuItems.push({
                parentId: MENU_ROOT_ID,
                type: "separator"
            });

            menuItems.push({
                id: MENU_SUBENTRY_ID_PREFIX + MENU_ENTRY_OPTIONS,
                parentId: MENU_ROOT_ID,
                title: i18n("menuOptions")
            });

            createMenuItems(menuItems);
        }
    });
}

function createMenuItems(items) {
    if (typeof items !== undefined && items.length > 0) {
        browser.menus.create(items.pop(), createMenuItems(items));
    }
}

/* =====================================================================================================================
   listeners ...
 */

function addContextMenuListener() {
    browser.menus.onClicked.addListener(async (info, tab) => {
        let commandOrSignatureId = info.menuItemId.startsWith(MENU_SUBENTRY_ID_PREFIX) ? info.menuItemId.substring(info.menuItemId.lastIndexOf(MENU_ID_SEPARATOR + 1)) : undefined;

        switch (info.menuItemId) {
            case MENU_ENTRY_ONOFF:
                searchSignatureInComposer(tab.id).then(foundSignatureId => {
                    if (foundSignatureId === "") {
                        appendDefaultSignatureToComposer(tab.id);
                    } else {
                        removeSignatureFromComposer(tab.id);
                    }
                })
                break;
            case MENU_ENTRY_OPTIONS:
                openOptions();
                break;
            default:
                appendSignatureViaIdToComposer(commandOrSignatureId, tab.id);
                break;
        }
    });
}

function addStorageChangeListener() {
    browser.storage.onChanged.addListener(changes => {
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
    browser.commands.onCommand.addListener(name => {
        browser.windows.getAll().then(windows => {
            for (let window of windows) {
                if (window.type === WINDOW_TYPE_MESSAGE_COMPOSE && window.focused === true) {
                    browser.tabs.query({windowId: window.id}).then(async tabs => {
                        let mailTabId = tabs[0].id;
                        let foundSignatureId = await searchSignatureInComposer(mailTabId);

                        switch (name) {
                            case COMMAND_SWITCH:
                                if (foundSignatureId === "") {
                                    appendDefaultSignatureToComposer(mailTabId);
                                } else {
                                    removeSignatureFromComposer(mailTabId);
                                }
                                break;
                            case COMMAND_NEXT:
                            case COMMAND_PREVIOUS:
                                if (foundSignatureId === "") {
                                    appendDefaultSignatureToComposer(mailTabId);
                                } else {
                                    let signatureIds = await getAllSignatureIds();
                                    let signatureIndex = signatureIds.indexOf(foundSignatureId);
                                    if (signatureIndex !== -1) {
                                        let newSignatureIndex;
                                        if (name === COMMAND_NEXT) {
                                            newSignatureIndex = signatureIndex === (signatureIds.length - 1) ? 0 : signatureIndex + 1;
                                        } else {
                                            newSignatureIndex = signatureIndex === 0 ? signatureIds.length - 1 : signatureIndex - 1;
                                        }

                                        appendSignatureViaIdToComposer(signatureIds[newSignatureIndex], mailTabId);
                                    }
                                }
                                break;
                        }
                    });
                    break;
                }
            }
        });
    });
}

function addMessageListener() {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.type) {
            case "switchSignature":
                if (request.value === "on") {
                    appendDefaultSignatureToComposer();
                } else {
                    removeSignatureFromComposer();
                }
                break;
            case "insertSignature":
                appendSignatureViaIdToComposer(request.value);
                break;
            case "isSignaturePresent":
                sendResponse({result: composeActionSignatureId !== ""});
                break;
            case "focusOptionsWindow":
                browser.windows.update(request.value, {
                    drawAttention: true,
                    focused: true}
                );
                break;
            default:
                console.log("invalid message type!");
        }
    });
}

function addBrowserActionListener() {
    browser.browserAction.onClicked.addListener(() => {
        openOptions();
    });
}

function addComposeActionListener() {
    browser.composeAction.onClicked.addListener(tab => {
        composeActionTabId = tab.id;

        searchSignatureInComposer().then(foundSignatureId => {
            composeActionSignatureId = foundSignatureId;
        });

        // "dirty hack" ;-)
        // (this way we can have both a popup(script) and the click-event in here)
        browser.composeAction.setPopup({popup: "/compose/popup.html"});
        browser.composeAction.openPopup();
        browser.composeAction.setPopup({popup: ""});
    });
}

function addWindowCreateListener() {
    browser.windows.onCreated.addListener(window => {
        if (window.type === WINDOW_TYPE_MESSAGE_COMPOSE) {
            browser.tabs.query({windowId: window.id}).then(async tabs => {
                let tabId = tabs[0].id;
                let storage = await browser.storage.local.get();
                let isReply = await isReplyComposer(tabId);
                let isForward = await isForwardComposer(tabId);

                // check if it's a reply/forward and if we DON'T want to perform the default-action
                if ((isReply && storage.repliesNoDefaultAction === true) ||
                    (isForward && storage.forwardingsNoDefaultAction === true) ) {
                    // don't perform any default-actions.
                } else {
                    // check if a default-action is set
                    if (storage.defaultAction) {
                        // execute default-action
                        if (storage.defaultAction === "insert") {
                            appendDefaultSignatureToComposer(tabId);
                        } else {
                            removeSignatureFromComposer(tabId);
                        }
                    }
                }

                // don't trigger auto-switch for replies/forwardings if disabled in options
                if (!(isReply && storage.repliesDisableAutoSwitch === true) ||
                    !(isForward && storage.forwardingsDisableAutoSwitch === true)) {
                    startRecipientChangeListener(tabId);
                }
            });
        }
    });
}

/* =====================================================================================================================
   composer interaction ...
 */

async function appendSignatureToComposer(signature, tabId = composeActionTabId) {
    let details = await browser.compose.getComposeDetails(tabId);
    let cleansedBody = await getBodyWithoutSignature(details);

    if (details.isPlainText) {
        cleansedBody += await createPlainTextSignature(signature.text);
        browser.compose.setComposeDetails(tabId, {plainTextBody: cleansedBody});
    } else {
        let document = domParser.parseFromString(cleansedBody, "text/html");
        let renderedSignature;
        if (signature.html !== "") {
            renderedSignature = await createHtmlSignature(document, signature.html, signature.id);
        } else {
            // fallback to plaintext-signature content
            renderedSignature = await createHtmlSignature(document, signature.text, signature.id, "pre");
        }

        document.body.appendChild(renderedSignature);

        browser.compose.setComposeDetails(tabId, {body: xmlSerializer.serializeToString(document)});
    }
}

async function appendDefaultSignatureToComposer(tabId = composeActionTabId) {
    browser.storage.local.get().then(async localStorage => {
        if (localStorage.signatures && localStorage.signatures.length > 0) {
            let allExistingSignatureIds = await getAllSignatureIds(localStorage.signatures);
            let actualDefaultSignature = undefined;

            if (localStorage.defaultSignature) {
                // check if the stored defaultSignatureId actually still exists
                if (allExistingSignatureIds.some(id => id === localStorage.defaultSignature)) {
                    for (let signature of localStorage.signatures) {
                        if (signature.id === localStorage.defaultSignature) {
                            actualDefaultSignature = signature;
                            break;
                        }
                    }
                }
            }

            // if the stored defaultSignatureId doesn't exist; use the first signature instead
            if (actualDefaultSignature === undefined) {
                actualDefaultSignature = localStorage.signatures[0];
            }

            appendSignatureToComposer(actualDefaultSignature, tabId);
        }
    });
}

async function appendSignatureViaIdToComposer(signatureId, tabId = composeActionTabId) {
    browser.storage.local.get().then(localStorage => {
        if (localStorage.signatures) {
            let signatures = localStorage.signatures;
            for (let signature of signatures) {
                if (signature.id === signatureId) {
                    appendSignatureToComposer(signature, tabId);
                    break;
                }
            }
        }
    });
}

async function removeSignatureFromComposer(tabId = composeActionTabId) {
    browser.compose.getComposeDetails(tabId).then(async details => {
        let bodyWithoutSignature = await getBodyWithoutSignature(details);
        let newDetails = details.isPlainText ? {plainTextBody: bodyWithoutSignature} : {body: bodyWithoutSignature};
        browser.compose.setComposeDetails(tabId, newDetails);
    });
}

async function searchSignatureInComposer(tabId = composeActionTabId) {
    let localStorage = await browser.storage.local.get();

    if (localStorage.signatures) {
        let signatures = localStorage.signatures;
        let details = await browser.compose.getComposeDetails(tabId);
        let bodyDocument = details.isPlainText ? undefined : domParser.parseFromString(details.body, "text/html");

        for (let signature of signatures) {
            if (details.isPlainText) {
                let plainTextBody = await normalizePlainTextBody(details.plainTextBody);

                // check if the signature contains a fortune-cookie placeholder
                if (new RegExp(".*\\[\\[.*\\]\\].*").test(signature.text)) {
                    if (localStorage.fortuneCookies) {
                        // TODO
                        // refactor me! pretty wonky implementation/concept!
                        // this assumes that only ONE fc-tag is present/used in the signature
                        let fortuneCookiesTag = signature.text.substring(signature.text.indexOf("[[") + 2, signature.text.indexOf("]]"));
                        for (let fortuneCookies of localStorage.fortuneCookies) {
                            if (fortuneCookies.tag === fortuneCookiesTag) {
                                for (let cookie of fortuneCookies.cookies) {
                                    // check if the composer body contains a cookie of that sig, plus the text before AND after the fc-tag
                                    if (plainTextBody.includes(cookie) &&
                                        plainTextBody.includes(signature.text.substring(0, signature.text.indexOf("[["))) &&
                                        plainTextBody.includes(signature.text.substring(signature.text.indexOf("]]") + 2), signature.text.length - 1)) {
                                        return signature.id;
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (plainTextBody.endsWith(await createPlainTextSignature(signature.text))) {
                        return signature.id;
                    }
                }
            } else {
                let htmlSignatures = bodyDocument.getElementsByClassName(HTML_SIGNATURE_CLASS);

                if (htmlSignatures && htmlSignatures.length > 0) {
                    let lastHtmlSignature = htmlSignatures[htmlSignatures.length - 1];
                    if (lastHtmlSignature.hasAttribute(CUSTOM_SIGNATURE_ID_ATTRIBUTE)) {
                        return lastHtmlSignature.getAttribute(CUSTOM_SIGNATURE_ID_ATTRIBUTE);
                    }
                }
            }
        }
    }

    return "";
}

function autoSwitchBasedOnRecipients(tabId = composeActionTabId) {
    browser.compose.getComposeDetails(tabId).then(details => {
        if (details.to.length > 0) {
            browser.storage.local.get().then(localStorage => {
                if (localStorage.signatures) {
                    for (let signature of localStorage.signatures) {
                        if (signature.autoSwitch && signature.autoSwitch.trim() !== "") {
                            let autoSwitchItems = signature.autoSwitch.split(",");
                            for (let autoSwitchItem of autoSwitchItems) {
                                let regEx = createRegexFromAutoSwitchString(autoSwitchItem.trim());
                                for (let recipient of details.to) {
                                    if (regEx.test(cleanseRecipientString(recipient))) {
                                        appendSignatureViaIdToComposer(signature.id, tabId);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    });
}

/* =====================================================================================================================
   signature creation ...
 */

async function createPlainTextSignature(text) {
    text = await searchAndReplaceFortuneCookiePlaceholder(text);

    return  NEW_LINE +
            PLAINTEXT_SIGNATURE_SEPARATOR +
            text;
}

async function createHtmlSignature(document, html, signatureId, elementType = "div") {
    html = await searchAndReplaceImagePlaceholder(html);
    html = await searchAndReplaceFortuneCookiePlaceholder(html);

    let element = document.createElement(elementType);
    element.innerHTML = html;
    element.className = HTML_SIGNATURE_CLASS;
    element.setAttribute(CUSTOM_SIGNATURE_ID_ATTRIBUTE, signatureId);

    // TB itself also adds this attribute on plaintext-sigs in HTML-mode
    if (elementType === "pre") {
        element.setAttribute("cols", "72");
    }

    // prepend the sig-separator if activated in options
    if ((await browser.storage.local.get()).signatureSeparatorHtml) {
        let separator = document.createElement("pre");
        separator.innerText = PLAINTEXT_SIGNATURE_SEPARATOR;
        element.prepend(separator);
    }

    return element;
}

async function searchAndReplaceImagePlaceholder(content) {
    if (new RegExp(".*{{.*}}.*").test(content)) {
        await browser.storage.local.get().then(localStorage => {
            if (localStorage.images) {
                for (let image of localStorage.images) {
                    content = content.replaceAll(new RegExp("{{" + image.tag + "}}", "g"), image.data);
                }
            }
        });
    }

    return content;
}

async function searchAndReplaceFortuneCookiePlaceholder(content) {
    if (new RegExp(".*\\[\\[.*\\]\\].*").test(content)) {
        await browser.storage.local.get().then(localStorage => {
            if (localStorage.fortuneCookies) {
                for (let fortuneCookies of localStorage.fortuneCookies) {
                    content = content.replaceAll(new RegExp("\\[\\[" + fortuneCookies.tag + "\\]\\]", "g"), fortuneCookies.cookies[random(fortuneCookies.cookies.length) - 1]);
                }
            }
        });
    }

    return content;
}

/* =====================================================================================================================
   helpers ...
 */

async function getBodyWithoutSignature(composeDetails) {
    if (composeDetails.isPlainText) {
        let body = await normalizePlainTextBody(composeDetails.plainTextBody);
        let signatureIndex = body.lastIndexOf(NEW_LINE + PLAINTEXT_SIGNATURE_SEPARATOR);

        return signatureIndex > -1 ? body.substring(0, body.lastIndexOf(NEW_LINE + PLAINTEXT_SIGNATURE_SEPARATOR)) : body;
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

async function getAllSignatureIds(signaturesArray) {
    let ids = [];
    let signatures;

    if (!signaturesArray) {
        await browser.storage.local.get().then(localStorage => {
            signatures = localStorage.signatures ? localStorage.signatures : [];
        });
    } else {
        signatures = signaturesArray;
    }

    signatures.forEach(signature => {
        ids.push(signature.id);
    });

    return ids;
}

async function isReplyComposer(tabId = composeActionTabId) {
    return await browser.compose.getComposeDetails(tabId).then(details => {
        return details.subject.startsWith(REPLY_SUBJECT_PREFIX);
    });
}

async function isForwardComposer(tabId = composeActionTabId) {
    return await browser.compose.getComposeDetails(tabId).then(details => {
        return details.subject.startsWith(FORWARD_SUBJECT_PREFIX);
    });
}

async function startRecipientChangeListener(tabId, timeout = 1000, previousRecipients = "") {
    try {
        let details = await browser.compose.getComposeDetails(tabId);
        let currentRecipients = details.to + "";

        if (currentRecipients !== previousRecipients) {
            autoSwitchBasedOnRecipients(tabId);
        }

        setTimeout(() => {
            startRecipientChangeListener(tabId, timeout, currentRecipients);
        }, timeout);
    } catch (e) {
        // tabId probably not valid anymore; window closed
        return;
    }
}

function createRegexFromAutoSwitchString(autoSwitchString) {
    return new RegExp(autoSwitchString
        .replaceAll(".", "\.")
        .replaceAll("*", ".*"),
        "i");
}

function cleanseRecipientString(recipient) {
    // check if we got something like '"Moe Zilla" <moe@zilla.org>'; return plain email-address
    if (new RegExp(".*<.*>.*").test(recipient)) {
        recipient = recipient.substr(recipient.indexOf("<") + 1);
        recipient = recipient.substr(0, recipient.lastIndexOf(">"));
    }

    return recipient;
}

// workaround; until this issue is resolved: https://bugzilla.mozilla.org/show_bug.cgi?id=1672407
async function normalizePlainTextBody(plainTextBody) {
    let platformInfo = await browser.runtime.getPlatformInfo();

    // remove all "carriage return" sequences from the plaintext-body if running on windows
    if (platformInfo.os === browser.runtime.PlatformOs.WIN) {
        return plainTextBody.replaceAll(new RegExp("\\r", "g"), "");
    }

    return plainTextBody;
}
