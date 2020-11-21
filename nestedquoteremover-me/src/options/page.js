let ui = {};

(() => {
    for (let element of document.querySelectorAll("[id]")) {
        ui[element.id] = element;
    }

    dataI18n();

    ui.keyboardShortcut.placeholder = browser.i18n.getMessage("optionsKeyboardShortcutPlaceholder");

    browser.storage.local.get().then(localStorage => {
        // =============================================================================================================
        // maxAllowedQuoteDepth
        // =============================================================================================================
        ui.maxAllowedQuoteDepth.value = localStorage.maxAllowedQuoteDepth !== undefined ? localStorage.maxAllowedQuoteDepth : 1;
        ui.maxAllowedQuoteDepth.addEventListener("change", () => {
            browser.storage.local.set({maxAllowedQuoteDepth: ui.maxAllowedQuoteDepth.value});
        });

        // =============================================================================================================
        // autoRemove
        // =============================================================================================================
        ui.autoRemove.checked = localStorage.autoRemove !== undefined ? localStorage.autoRemove : false;
        ui.autoRemove.addEventListener("change", () => {
            browser.storage.local.set({autoRemove: ui.autoRemove.checked});
        });

        // =============================================================================================================
        // keyboardShortcut
        // =============================================================================================================
        displayCurrentKeyboardShortcut();
        ui.keyboardShortcutSet.addEventListener("click", () => {
            updateKeyboardShortcut(ui.keyboardShortcut.value);
        })
        ui.keyboardShortcutReset.addEventListener("click", () => {
            resetKeyboardShortcut();
            displayCurrentKeyboardShortcut();
        });

        // =============================================================================================================
        // removeQuotedReplyHeader
        // =============================================================================================================
        ui.removeQuotedReplyHeader.checked = localStorage.removeQuotedReplyHeader !== undefined ? localStorage.removeQuotedReplyHeader : true;
        ui.removeQuotedReplyHeader.addEventListener("change", () => {
            browser.storage.local.set({removeQuotedReplyHeader: ui.removeQuotedReplyHeader.checked});
        });

        // =============================================================================================================
        // replyHeaderPattern
        // =============================================================================================================
        ui.replyHeaderPattern.value = localStorage.replyHeaderPattern !== undefined ? localStorage.replyHeaderPattern : browser.i18n.getMessage("optionsReplyHeaderPatternDefault");
        ui.replyHeaderPattern.addEventListener("change", () => {
            browser.storage.local.set({replyHeaderPattern: ui.replyHeaderPattern.value});
        });

        // =============================================================================================================
        // contextMenuEntry
        // =============================================================================================================
        ui.contextMenuEntry.checked = localStorage.contextMenuEntry !== undefined ? localStorage.contextMenuEntry : true;
        ui.contextMenuEntry.addEventListener("change", () => {
            browser.storage.local.set({contextMenuEntry: ui.contextMenuEntry.checked});
        });
    });
})()

async function displayCurrentKeyboardShortcut() {
    // TODO
    // Temporary workaround until this issue is fixed:
    //    https://developer.thunderbird.net/add-ons/updating/tb78#replacing-options
    //
    // browser.commands.getAll().then(commands => {
    (await browser.runtime.getBackgroundPage()).browser.commands.getAll().then(commands => {
        for (let command of commands) {
            if (command.name === "removeNestedQuotes") {
                ui.keyboardShortcut.value = command.shortcut;
            }
        }
    });
}

async function updateKeyboardShortcut(value) {
    // TODO
    // Temporary workaround until this issue is fixed:
    //    https://developer.thunderbird.net/add-ons/updating/tb78#replacing-options
    //
    // browser.commands.update({
    (await browser.runtime.getBackgroundPage()).browser.commands.update({
        name: "removeNestedQuotes",
        shortcut: value
    });
}

async function resetKeyboardShortcut() {
    // TODO
    // Temporary workaround until this issue is fixed:
    //    https://developer.thunderbird.net/add-ons/updating/tb78#replacing-options
    //
    // await browser.commands.reset("removeNestedQuotes");
    await (await browser.runtime.getBackgroundPage()).browser.commands.reset("removeNestedQuotes");
}

function dataI18n() {
    for (const node of document.querySelectorAll('[data-i18n]')) {
        // NOTE: we only support _ONE_ attribute (separated by '|') atm!
        let [text, attr] = node.dataset.i18n.split('|');

        if (attr) {
            if (attr.charAt(0) === "$") {
                attr = browser.i18n.getMessage(attr.substring(1));
            }

            text = browser.i18n.getMessage(text, attr);
        } else {
            text = browser.i18n.getMessage(text);
        }

        node.appendChild(document.createTextNode(text));
    }
}
