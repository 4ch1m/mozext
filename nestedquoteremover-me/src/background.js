const BLOCKQUOTE_CITE_SELECTOR = 'blockquote[type="cite"]';
const DOCUMENT_TYPE = "text/html";
const NEW_LINE = "\n";
const WINDOW_TYPE_MESSAGE_COMPOSE = "messageCompose";

const xmlSerializer = new XMLSerializer();
const domParser = new DOMParser();

let platformInfo;

let deletableBlockQuotes = [];

let maxAllowedQuoteDepth = 1;
let autoRemove = false;
let contextMenuEntry = true;

(async () => {
    platformInfo = await browser.runtime.getPlatformInfo();

    await browser.storage.local.get().then(localStorage => {
        if (localStorage.maxAllowedQuoteDepth) {
            maxAllowedQuoteDepth = parseInt(localStorage.maxAllowedQuoteDepth);
        }

        if (localStorage.autoRemove) {
            autoRemove = localStorage.autoRemove;
        }

        if (localStorage.contextMenuEntry) {
            contextMenuEntry = localStorage.contextMenuEntry;
        }
    });

    addContextMenuEntry();
    addContextMenuListener();
    addStorageChangeListener();
    addComposeActionListener();
    addCommandListener();
    addWindowCreateListener();
})();

function addContextMenuEntry() {
    browser.menus.remove("nestedquote_remover");

    if (contextMenuEntry) {
        browser.menus.create({
            id: "nestedquote_remover",
            title: browser.i18n.getMessage("contextMenu"),
            command: "_execute_browser_action",
            contexts: [
                // TODO
                // the MailExtension-API lacks a suitable context-type for the composer-window;
                // so this won't work atm
                "editable"
            ]
        });
    }
}

function addContextMenuListener() {
    browser.menus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === "nestedquote_remover") {
            removeNestedQuotes(tab.id);
        }
    });
}

function addStorageChangeListener() {
    browser.storage.onChanged.addListener((changes) => {
        let changedItems = Object.keys(changes);

        for (let item of changedItems) {
            switch (item) {
                case "maxAllowedQuoteDepth":
                    maxAllowedQuoteDepth = parseInt(changes[item].newValue);
                    break;
                case "autoRemove":
                    autoRemove = changes[item].newValue;
                    break;
                case "contextMenuEntry":
                    contextMenuEntry = changes[item].newValue;
                    addContextMenuEntry();
                    break;
            }
        }
    });
}

function addComposeActionListener() {
    browser.composeAction.onClicked.addListener(tab => {
        removeNestedQuotes(tab.id);
    });
}

function addCommandListener() {
    browser.commands.onCommand.addListener(name => {
        if (name === "removeNestedQuotes") {
            browser.windows.getAll().then(windows => {
                for (let window of windows) {
                    if (window.type === WINDOW_TYPE_MESSAGE_COMPOSE && window.focused === true) {
                        browser.tabs.query({windowId: window.id}).then(tabs => {
                            removeNestedQuotes(tabs[0].id);
                        });
                        break;
                    }
                }
            });
        }
    });
}

function addWindowCreateListener() {
    browser.windows.onCreated.addListener(window => {
        if (autoRemove && window.type === WINDOW_TYPE_MESSAGE_COMPOSE) {
            browser.tabs.query({windowId: window.id}).then(tabs => {
                removeNestedQuotes(tabs[0].id);
            });
        }
    });
}

function removeNestedQuotes(tabId) {
    browser.compose.getComposeDetails(tabId).then(details => {
        let nestedQuotesFound = false;
        let newDetails;

        if (details.isPlainText) {
            let quotePattern = getPlainTextQuotePattern(maxAllowedQuoteDepth + 1);
            let currentPlainTextBody = details.plainTextBody;
            let newPlainTextBody = "";

            // workaround; until this issue is resolved: https://bugzilla.mozilla.org/show_bug.cgi?id=1672407
            // remove all "carriage return" sequences from the plaintext-body if running on Windows
            if (platformInfo.os === browser.runtime.PlatformOs.WIN) {
                currentPlainTextBody = currentPlainTextBody.replaceAll(new RegExp("\\r", "g"), "");
            }

            currentPlainTextBody.split(NEW_LINE).forEach(line => {
                if (!line.startsWith(quotePattern)) {
                    nestedQuotesFound = true;
                    newPlainTextBody += (newPlainTextBody === "") ? line : (NEW_LINE + line);
                }
            })

            newDetails = {plainTextBody: newPlainTextBody};
        } else {
            deletableBlockQuotes = [];

            let document = domParser.parseFromString(details.body, DOCUMENT_TYPE);
            let blockQuotes = document.querySelectorAll(BLOCKQUOTE_CITE_SELECTOR);

            if (blockQuotes.length > 0) {
                searchDeletableBlockQuotes(blockQuotes, 1);

                if (deletableBlockQuotes.length > 0) {
                    nestedQuotesFound = true;

                    while (deletableBlockQuotes.length > 0) {
                        deletableBlockQuotes.pop().remove();
                    }

                    newDetails = {body: xmlSerializer.serializeToString(document)};
                }
            }
        }

        if (nestedQuotesFound) {
            browser.compose.setComposeDetails(tabId, newDetails);
        }
    });
}

function getPlainTextQuotePattern(depth) {
    let pattern = ">";

    if (depth) {
        let i = 0;
        while (++i < depth) {
            pattern += ">";
        }
    }

    return pattern;
}

function searchDeletableBlockQuotes(blockQuotes, quoteLevel) {
    for (let blockQuote of blockQuotes) {
        if (quoteLevel > maxAllowedQuoteDepth) {
            deletableBlockQuotes.push(blockQuote);
        } else {
            let subBlockQuotes = blockQuote.querySelectorAll(BLOCKQUOTE_CITE_SELECTOR);
            if (subBlockQuotes.length > 0) {
                searchDeletableBlockQuotes(subBlockQuotes, quoteLevel + 1);
            }
        }
    }
}
