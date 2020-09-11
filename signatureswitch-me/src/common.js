let optionsTabId;

function openOptions(callback) {
    browser.tabs.create({url: "/options/page.html"}).then(optionsTab => {
        optionsTabId = optionsTab.id;
    }).then(callback);
}

function arrayMove(array, from, to) {
    array = [...array];

    const startIndex = from < 0 ? array.length + from : from;

    if (startIndex >= 0 && startIndex < array.length) {
        const endIndex = to < 0 ? array.length + to : to;

        const [item] = array.splice(from, 1);
        array.splice(endIndex, 0, item);
    }

    return array;
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
