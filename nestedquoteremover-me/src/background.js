const WINDOW_TYPE_MESSAGE_COMPOSE = "messageCompose";

// defaults ...
let maxAllowedQuoteDepth = 1;
let autoRemove = false;
let removeQuotedReplyHeader = true;
let replyHeaderPattern = browser.i18n.getMessage("optionsReplyHeaderPatternDefault");
let contextMenuEntry = true;

(async () => {

    await browser.storage.local.get().then(localStorage => {
        if (localStorage.maxAllowedQuoteDepth !== undefined) {
            maxAllowedQuoteDepth = parseInt(localStorage.maxAllowedQuoteDepth);
        }
        if (localStorage.autoRemove !== undefined) {
            autoRemove = localStorage.autoRemove;
        }
        if (localStorage.removeQuotedReplyHeader !== undefined) {
            removeQuotedReplyHeader = localStorage.removeQuotedReplyHeader;
        }
        if (localStorage.replyHeaderPattern !== undefined) {
            replyHeaderPattern = localStorage.replyHeaderPattern;
        }
        if (localStorage.contextMenuEntry !== undefined) {
            contextMenuEntry = localStorage.contextMenuEntry;
        }
    });

    registerComposeScript();
    addContextMenuEntry();

    // listeners ...
    addContextMenuListener();
    addStorageChangeListener();
    addComposeActionListener();
    addCommandListener();
    addWindowCreateListener();
})();

function registerComposeScript() {
    browser.composeScripts.register({
        js: [ {file: "compose.js"} ]
    });
}

function addContextMenuEntry() {
    browser.menus.remove("nestedquote_remover");

    if (contextMenuEntry) {
        browser.menus.create({
            id: "nestedquote_remover",
            title: browser.i18n.getMessage("contextMenu"),
            command: "_execute_browser_action",
            contexts: [ "page" ]
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
    browser.storage.onChanged.addListener(changes => {
        let changedItems = Object.keys(changes);

        for (let item of changedItems) {
            switch (item) {
                case "maxAllowedQuoteDepth":
                    maxAllowedQuoteDepth = parseInt(changes[item].newValue);
                    break;
                case "autoRemove":
                    autoRemove = changes[item].newValue;
                    break;
                case "removeQuotedReplyHeader":
                    removeQuotedReplyHeader = changes[item].newValue;
                    break;
                case "replyHeaderPattern":
                    replyHeaderPattern = changes[item].newValue;
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
                    if (window.type === WINDOW_TYPE_MESSAGE_COMPOSE && window.focused) {
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
            browser.tabs.query({windowId: window.id}).then(async tabs => {
                let tabId = tabs[0].id;
                await waitForComposeMessageListener(tabId);
                removeNestedQuotes(tabId);
            });
        }
    });
}

function removeNestedQuotes(tabId) {
    browser.compose.getComposeDetails(tabId).then(details => {
        browser.tabs.sendMessage(tabId, {
            type: "removeNestedQuotes",
            value: {
                isPlaintext: details.isPlainText,
                maxAllowedQuoteDepth: maxAllowedQuoteDepth,
                removeQuotedReplyHeader: removeQuotedReplyHeader && replyHeaderPattern.trim() !== "",
                replyHeaderPattern: replyHeaderPattern
            }
        });
    }).catch(() => {
        // we sometime get an "editor is null" error from 'getComposeDetails';
        // seems that the editor isn't ready fast enough sometimes;
        // so we try again in half a second
        setTimeout(() => {
            removeNestedQuotes(tabId);
        }, 500);
    });
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
