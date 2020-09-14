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
        ui.maxAllowedQuoteDepth.value = localStorage.maxAllowedQuoteDepth ? localStorage.maxAllowedQuoteDepth : 1;
        ui.maxAllowedQuoteDepth.addEventListener("change", () => {
            browser.storage.local.set({maxAllowedQuoteDepth: ui.maxAllowedQuoteDepth.value});
        });

        // =============================================================================================================
        // keyboardShortcut
        // =============================================================================================================
        displayCurrentKeyboardShortcut();
        ui.keyboardShortcutSet.addEventListener("click", () => {
            updateKeyboardShortcut(ui.keyboardShortcut.value);
        })
        ui.keyboardShortcutReset.addEventListener("click", async () => {
            await browser.commands.reset("removeNestedQuotes");
            displayCurrentKeyboardShortcut();
        });

        // =============================================================================================================
        // autoRemove
        // =============================================================================================================
        ui.autoRemove.checked = localStorage.autoRemove ? localStorage.autoRemove : false;
        ui.autoRemove.addEventListener("change", () => {
            browser.storage.local.set({autoRemove: ui.autoRemove.checked});
        });

        // =============================================================================================================
        // contextMenuEntry
        // =============================================================================================================
        ui.contextMenuEntry.checked = localStorage.contextMenuEntry ? localStorage.contextMenuEntry : true;
        ui.contextMenuEntry.addEventListener("change", () => {
            browser.storage.local.set({contextMenuEntry: ui.contextMenuEntry.checked});
        });
    });
})()

function displayCurrentKeyboardShortcut() {
    browser.commands.getAll().then(commands => {
        for (let command of commands) {
            if (command.name === "removeNestedQuotes") {
                ui.keyboardShortcut.value = command.shortcut;
            }
        }
    });
}

function updateKeyboardShortcut(value) {
    browser.commands.update({
        name: "removeNestedQuotes",
        shortcut: value
    });
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
