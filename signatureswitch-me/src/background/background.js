const NEW_LINE = "\n";
const DOUBLE_DASH = "--";

const PLAINTEXT_SIGNATURE_SEPARATOR = DOUBLE_DASH + " " + NEW_LINE;

const CLASS_MOZ_SIGNATURE = "moz-signature";
const CLASS_SIGNATURE_SWITCH_SUFFIX = "signature-switch-suffix";
const CLASS_SIGNATURE_SWITCH_COMPOSE_SEPARATOR = "signature-switch-compose-separator";
const CLASS_NO_PRINT = "no-print";

const ATTRIBUTE_SIGNATURE_SWITCH_ID = "signature-switch-id";
const ATTRIBUTE_MOZ_DIRTY = "_moz_dirty";
const ATTRIBUTE_COLS = "cols";

const WINDOW_TYPE_MESSAGE_COMPOSE = "messageCompose";

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

const REGEXP_IMAGES = new RegExp("\\{\\{(.*?)\\}\\}");
const REGEXP_FORTUNE_COOKIES = new RegExp("\\[\\[(.*?)\\]\\]");
const REGEXP_NATIVE_MESSAGING = new RegExp("_{2}([^_].+)_{2}");

// ---------------------------------------------------------------------------------------------------------------------

let composeActionTabId;
let composeActionSignatureId;

let recipientChangeListeners = new Map();

/* =====================================================================================================================
   init ...
 */

(() => {
    if (typeof browser === "undefined") {
        return; // exit init if running unit-tests
    }

    // compose script
    browser.composeScripts.register({
        js: [ {file: "/compose/compose.js"} ],
        css: [ {file: "/compose/compose.css"} ]
    });

    // context-menu
    createContextMenu();

    // listeners
    addContextMenuListener();
    addStorageChangeListener();
    addCommandListener();
    addMessageListener();
    addBrowserActionListener();
    addComposeActionListener();
    addWindowCreateListener();
    addOnBeforeSendListener();
    addIdentityChangeListener();
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
            contexts: [ "page" ]
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
        let commandOrSignatureId =
            info.menuItemId.startsWith(MENU_SUBENTRY_ID_PREFIX) ?
                info.menuItemId.substring(info.menuItemId.lastIndexOf(MENU_ID_SEPARATOR) + 1) : undefined;

        switch (commandOrSignatureId) {
            case undefined:
                break;
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
        let changedItems = Object.keys(changes);

        for (let item of changedItems) {
            switch (item) {
                case "signatures":
                    if (JSON.stringify(changes[item].newValue) !== JSON.stringify(changes[item].oldValue)) {
                        createContextMenu();
                    }
                    break;
            }
        }
    });
}

function addCommandListener() {
    browser.commands.onCommand.addListener(name => {
        browser.windows.getAll().then(windows => {
            for (let window of windows) {
                if (window.type === WINDOW_TYPE_MESSAGE_COMPOSE && window.focused) {
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
    browser.runtime.onMessage.addListener(request => {
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
                return Promise.resolve({result: composeActionSignatureId !== ""});
            case "focusOptionsWindow":
                browser.windows.update(request.value, {
                    drawAttention: true,
                    focused: true}
                );
                break;
            case "sendNativeMessage":
                return new Promise(async resolve => {
                    resolve(JSON.stringify(await sendNativeMessage(request.value)));
                });
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

                // wait until compose script is ready
                await waitForComposeMessageListener(tabId);

                let storage = await browser.storage.local.get();
                let details = await browser.compose.getComposeDetails(tabId);

                let isReply = details.subject.startsWith(REPLY_SUBJECT_PREFIX);
                let isForward = details.subject.startsWith(FORWARD_SUBJECT_PREFIX);

                // check if it's a reply/forward and if we DON'T want to perform the default-action
                let noDefaultAction = (isReply && storage.repliesNoDefaultAction) || (isForward && storage.forwardingsNoDefaultAction === true);

                // check if we should ignore the identity-sig b/c it's a reply or forwarding
                let ignoreIdentitySig = (isReply || isForward) && (!storage.identitiesUseAssignedSignatureOnReplyOrForwarding);

                // see if we can find an assigned signature for the current identity (but only if we don't ignore identitity-sigs)
                let identitySignatureId = "";
                if (!ignoreIdentitySig && storage.identities) {
                    for (let storageIdentity of storage.identities) {
                        if (storageIdentity.id === details.identityId) {
                            identitySignatureId = storageIdentity.signatureId;
                            break;
                        }
                    }
                }

                // check if we have an signature sig AND if it should take precedence over the default action/sig
                let identitySigAvailableAndOverrulesDefault = (identitySignatureId !== "") && (storage.identitiesOverruleDefaultAction);

                if (!noDefaultAction && !identitySigAvailableAndOverrulesDefault) {
                    // check if a default-action is set
                    if (storage.defaultAction) {
                        // execute default-action
                        switch (storage.defaultAction) {
                            case "insert":
                                appendDefaultSignatureToComposer(tabId);
                                break;
                            case "off":
                                removeSignatureFromComposer(tabId);
                                break;
                            default:
                                // do nothing
                                break;
                        }
                    }
                } else if (identitySignatureId !== "") {
                    // insert identity sig
                    appendSignatureViaIdToComposer(identitySignatureId, tabId);
                }

                // don't trigger recipient-based auto-switch for replies/forwardings if disabled in options
                if (!(isReply && storage.repliesDisableAutoSwitch) ||
                    !(isForward && storage.forwardingsDisableAutoSwitch)) {
                    startRecipientChangeListener(tabId, 1000, "", storage.autoSwitchIncludeCc, storage.autoSwitchIncludeBcc);
                }
            });
        }
    });
}

function addOnBeforeSendListener() {
    browser.compose.onBeforeSend.addListener(async tab => {
        await browser.tabs.sendMessage(tab.id, {
            type: "cleanUp",
            value: {
                selector: `.${CLASS_SIGNATURE_SWITCH_COMPOSE_SEPARATOR}`
            }
        });
        clearTimeout(recipientChangeListeners.get(tab.id));
        recipientChangeListeners.delete(tab.id);
    });
}

function addIdentityChangeListener() {
    browser.compose.onIdentityChanged.addListener(async (tab, identityId) => {
        let localStorage = await browser.storage.local.get();

        if (localStorage.identities && localStorage.identitiesSwitchSignatureOnChange) {
            for (let mailAccount of (await browser.accounts.list())) {
                for (let mailIdentity of mailAccount.identities) {
                    if (mailIdentity.id === identityId) {
                        for (let localStorageIdentity of localStorage.identities) {
                            if (localStorageIdentity.id === mailIdentity.id) {
                                appendSignatureViaIdToComposer(localStorageIdentity.signatureId, tab.id);
                                break;
                            }
                        }
                    }
                }
            }
        }
    });
}

/* =====================================================================================================================
   composer interaction ...
 */

async function appendSignatureToComposer(
    signature,
    tabId = composeActionTabId,
    signatureSeparatorHtml = true,
    aboveQuoteOrForwarding = false,
    composeSeparator = true ) {
    let details = await browser.compose.getComposeDetails(tabId);

    let signatureClasses = [ CLASS_MOZ_SIGNATURE ];

    let signatureAttributes = [
        {key: ATTRIBUTE_SIGNATURE_SWITCH_ID, value: signature.id},
        {key: ATTRIBUTE_MOZ_DIRTY, value: ""}
    ];

    let composeSeparatorElement = composeSeparator ? {
        type: "hr",
        classes: [
            CLASS_SIGNATURE_SWITCH_COMPOSE_SEPARATOR,
            CLASS_NO_PRINT
        ],
        attributes: [
            {key: ATTRIBUTE_MOZ_DIRTY, value: ""}
        ]

    } : undefined;

    let elements;

    if (details.isPlainText) {
        elements = {
            // when the body is still empty upon adding the sig, add a br _before_ the actual signature;
            // otherwise all entered text on top will be _inside_ the signature div - which is bad
            prepend: details.plainTextBody === "" ? {
                type: "br",
                attributes: [
                    {key: ATTRIBUTE_MOZ_DIRTY, value: ""}
                ]
            } : undefined,
            signature: {
                type: "div",
                classes: signatureClasses,
                attributes: signatureAttributes,
                innerHtml: await createSignatureForPlainTextComposer(signature.text, details.type, aboveQuoteOrForwarding)
            },
            // TB also always adds a new line at the end of a signature in plaintext mode
            postpend: {
                type: "br",
                classes: [
                    CLASS_SIGNATURE_SWITCH_SUFFIX // custom class for easier clean up later on
                ],
                attributes: [
                    {key: ATTRIBUTE_MOZ_DIRTY, value: ""}
                ]
            },
            composeSeparator: composeSeparatorElement
        };
    } else {
        // check if we need to use the plaintext-signature, b/c there's no html-signature available
        let plaintextFallback = signature.html === "";

        if (plaintextFallback) {
            // this attribute usually gets set by TB if a plaintext-sig is being used in HTML-mode
            signatureAttributes.push({key: ATTRIBUTE_COLS, value: "72"})
        }

        elements = {
            signature: {
                type: `${plaintextFallback ? "pre" : "div"}`,
                classes: signatureClasses,
                attributes: signatureAttributes,
                innerHtml: await createSignatureForHtmlComposer(
                    plaintextFallback ? signature.text : signature.html,
                    details.type,
                    signatureSeparatorHtml,
                    aboveQuoteOrForwarding
                )
            },
            composeSeparator: composeSeparatorElement
        };
    }

    // make sure to remove any existing signature beforehand
    await removeSignatureFromComposer(tabId);

    browser.tabs.sendMessage(tabId, {
        type: "appendSignature",
        value: {
            elements: elements,
            aboveQuoteOrForwarding: aboveQuoteOrForwarding
        }
    });
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

            appendSignatureToComposer(
                actualDefaultSignature,
                tabId,
                localStorage.signatureSeparatorHtml,
                localStorage.signaturePlacementAboveQuoteOrForwarding,
                localStorage.signatureComposeSeparator
            );
        }
    });
}

async function appendSignatureViaIdToComposer(signatureId, tabId = composeActionTabId) {
    browser.storage.local.get().then(localStorage => {
        if (localStorage.signatures) {
            let signatures = localStorage.signatures;
            for (let signature of signatures) {
                if (signature.id === signatureId) {
                    appendSignatureToComposer(
                        signature,
                        tabId,
                        localStorage.signatureSeparatorHtml,
                        localStorage.signaturePlacementAboveQuoteOrForwarding,
                        localStorage.signatureComposeSeparator
                    );
                    break;
                }
            }
        }
    });
}

async function removeSignatureFromComposer(tabId = composeActionTabId) {
    browser.tabs.sendMessage(tabId, {
        type: "removeSignature",
        value: {
            selector: `.${CLASS_MOZ_SIGNATURE}`,
            separator: `${DOUBLE_DASH} <br` // closing angle bracket omitted on purpose
        }
    });

    // also clean up the compose-separator and the extra trailing new lines (which we may have
    // inserted on purpose when adding the plaintext sig)
    for (let selector of [CLASS_SIGNATURE_SWITCH_COMPOSE_SEPARATOR, CLASS_SIGNATURE_SWITCH_SUFFIX]) {
        browser.tabs.sendMessage(tabId, {
            type: "cleanUp",
            value: {
                selector: `.${selector}`
            }
        });
    }
}

async function searchSignatureInComposer(tabId = composeActionTabId) {
    return (await browser.tabs.sendMessage(tabId, {
        type: "searchSignature",
        value: {
            selector: `[${ATTRIBUTE_SIGNATURE_SWITCH_ID}].${CLASS_MOZ_SIGNATURE}`,
            idAttribute: ATTRIBUTE_SIGNATURE_SWITCH_ID}
    })).signatureId;
}

function autoSwitchBasedOnRecipients(tabId = composeActionTabId, recipients) {
    if (recipients.length === 0) {
        return;
    }

    let anyAutoSwitchItemMatchesWithAnyRecipient = (autoSwitchItems, recipients) => {
        for (let autoSwitchItem of autoSwitchItems) {
            let regEx = createRegexFromAutoSwitchString(autoSwitchItem.trim());
            for (let recipient of recipients) {
                if (regEx.test(recipient)) {
                    return true;
                }
            }
        }
        return false;
    };

    let anyAutoSwitchItemMatchesWithAllRecipients = (autoSwitchItems, recipients) => {
        for (let recipient of recipients) {
            for (let autoSwitchItem of autoSwitchItems) {
                if (createRegexFromAutoSwitchString(autoSwitchItem.trim()).test(recipient)) {
                    break;
                }
                return false;
            }
        }
        return true;
    }

    browser.storage.local.get().then(localStorage => {
        if (localStorage.signatures) {
            for (let signature of localStorage.signatures) {
                if (signature.autoSwitch && signature.autoSwitch.trim() !== "") {
                    let autoSwitchItems = signature.autoSwitch.split(",");

                    let match = signature.autoSwitchMatchAll ?
                        anyAutoSwitchItemMatchesWithAllRecipients(autoSwitchItems, recipients) :
                        anyAutoSwitchItemMatchesWithAnyRecipient(autoSwitchItems, recipients)

                    if (match) {
                        appendSignatureViaIdToComposer(signature.id, tabId);
                        return;
                    }
                }
            }
        }
    });
}

/* =====================================================================================================================
   signature creation ...
 */

async function createSignatureForPlainTextComposer(content, composeType, signaturePlacementAboveQuoteOrForwarding = false) {
    // resolve placeholders
    content = await searchAndReplaceFortuneCookiePlaceholder(content);
    content = await searchAndReplaceNativeMessagingPlaceholder(content, { isPlainText: true, type: composeType });

    // make sure we have a sig-separator (but only if we don't put the signature above the reply-quote or forwarding)
    if (!content.trim().startsWith(PLAINTEXT_SIGNATURE_SEPARATOR) && !signaturePlacementAboveQuoteOrForwarding) {
        content = PLAINTEXT_SIGNATURE_SEPARATOR + content;
    }

    // transform new-lines to BRs with mozdirty-attribute and return
    return content.replaceAll(NEW_LINE, `<br ${ATTRIBUTE_MOZ_DIRTY}="">`);
}

async function createSignatureForHtmlComposer(content, composeType, signatureSeparatorHtml = true, aboveQuote = false) {
    // resolve placeholders
    content = await searchAndReplaceFortuneCookiePlaceholder(content);
    content = await searchAndReplaceImagePlaceholder(content);
    content = await searchAndReplaceNativeMessagingPlaceholder(content, { isPlainText: false, type: composeType });

    // prepend the sig-separator if activated in options (but only if we don't put the signature above the reply-quote or forwarding)
    if (signatureSeparatorHtml && !aboveQuote) {
        content = `${DOUBLE_DASH} <br ${ATTRIBUTE_MOZ_DIRTY}="">${content}`;
    }

    return content;
}

async function genericTagReplacer(content, regex, replacement) {
    if (regex.test(content)) {
        let matches = content.matchAll(new RegExp(regex, "g"));

        for (let match of matches) {
            let replacementString = await replacement(match[1])
            content = content.replace(match[0], replacementString);
        }
    }

    return content;
}

async function searchAndReplaceImagePlaceholder(content) {
    let images = {};

    await browser.storage.local.get().then(localStorage => {
        if (localStorage.images) {
            images = localStorage.images.reduce((map, obj) => {
                map[obj.tag] = obj.data;
                return map;
            }, {});
        }
    });

    return await genericTagReplacer(content, REGEXP_IMAGES, tag => {
        let trimmedTag = tag.trim();
        return trimmedTag in images ? images[trimmedTag] : "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" /* = empty image */;
    });
}

async function searchAndReplaceFortuneCookiePlaceholder(content) {
    let cookies = {};

    await browser.storage.local.get().then(localStorage => {
        if (localStorage.fortuneCookies) {
            cookies = localStorage.fortuneCookies.reduce((map, obj) => {
                map[obj.tag] = obj.cookies;
                return map;
            }, {});
        }
    });

    return await genericTagReplacer(content, REGEXP_FORTUNE_COOKIES, tag => {
        let trimmedTag = tag.trim();
        return trimmedTag  in cookies ? cookies[trimmedTag][random(cookies[trimmedTag].length) - 1] : "";
    });
}

async function searchAndReplaceNativeMessagingPlaceholder(content, composeDetails) {
    return await genericTagReplacer(content, REGEXP_NATIVE_MESSAGING, async tag => {
        let nativeMessage = await sendNativeMessage({
            tag: tag,
            isPlainText: composeDetails.isPlainText,
            type: composeDetails.type
        });

        return nativeMessage.success ? nativeMessage.response.message : "";
    });
}

/* =====================================================================================================================
   helpers ...
 */

async function startRecipientChangeListener(tabId, timeout = 1000, previousRecipients = "", includeCc = false, includeBcc = false) {
    try {
        let details = await browser.compose.getComposeDetails(tabId);
        let serializedRecipients = await serializeRecipients(details.to);

        if (includeCc) {
            serializedRecipients = [].concat(serializedRecipients, await serializeRecipients(details.cc));
        }
        if (includeBcc) {
            serializedRecipients = [].concat(serializedRecipients, await serializeRecipients(details.bcc));
        }

        let currentRecipients = serializedRecipients.join("|");
        if (currentRecipients !== previousRecipients) {
            autoSwitchBasedOnRecipients(tabId, serializedRecipients);
        }

        let timeoutId = setTimeout(() => {
            startRecipientChangeListener(tabId, timeout, currentRecipients, includeCc, includeBcc);
        }, timeout);

        recipientChangeListeners.set(tabId, timeoutId);
    } catch (e) {
        // tabId probably not valid anymore; window closed
    }
}

function createRegexFromAutoSwitchString(autoSwitchString) {
    return new RegExp(autoSwitchString
        .replaceAll(".", "\\.")
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

async function serializeRecipients(recipients) {
    let serializedRecipients = [];

    for (let recipient of (Array.isArray(recipients) ? recipients : [ recipients ])) {
        if (typeof recipient === "string" || recipient instanceof String) {
            let cleansedRecipientString = cleanseRecipientString(recipient);
            if (cleansedRecipientString !== "") {
                serializedRecipients.push(cleansedRecipientString);
            }
        } else {
            // see:
            //   https://thunderbird-webextensions.readthedocs.io/en/78/compose.html?highlight=getComposeDetails#compose-composerecipientlist
            switch(recipient.type) {
                case "contact":
                    for (let contact of await browser.contacts.list(recipient.id)) {
                        let primaryEmail = contact.properties.primaryEmail;
                        if (primaryEmail !== "") {
                            serializedRecipients.push(primaryEmail);
                        }
                    }
                    break;
                case "mailingList":
                    for (let list of await browser.mailingLists.get(recipient.id)) {
                        let listName = list.name;
                        if (listName !== "") {
                            serializedRecipients.push(listName);
                        }
                    }
                    break;
                default:
                    serializedRecipients.push(recipient);
            }
        }
    }

    return serializedRecipients;
}

async function sendNativeMessage(object) {
    try {
        return { success: true,
                 response: await messenger.runtime.sendNativeMessage("signatureswitch", object) };
    } catch(e) {
        return { success: false,
                 response: { message: e.message } };
    }
}

// make sure the compose-script is injected and ready to receive messages
async function waitForComposeMessageListener(tabId) {
    let result = "";
    while (result === "") {
        try {
            result = await browser.tabs.sendMessage(tabId, { type: "ping" }) === "";
        } catch(e) {}
    }
}
