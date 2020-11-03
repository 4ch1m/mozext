let optionsTabId;
let optionsWindowId;

function openOptions(callback) {
    browser.tabs.create({url: "/options/page.html"}).then(optionsTab => {
        optionsTabId = optionsTab.id;
        optionsWindowId = optionsTab.windowId;
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

function i18n(messageName, substitutions = undefined) {
    if (substitutions === undefined) {
        return browser.i18n.getMessage(messageName);
    } else {
        return browser.i18n.getMessage(messageName, substitutions);
    }
}

function dataI18n() {
    for (const node of document.querySelectorAll('[data-i18n]')) {
        // NOTE: we only support _ONE_ attribute (separated by '|') atm!
        let [text, attr] = node.dataset.i18n.split('|');

        if (attr) {
            if (attr.charAt(0) === "$") {
                attr = i18n(attr.substring(1));
            }

            text = i18n(text, attr);
        } else {
            text = i18n(text);
        }

        node.appendChild(document.createTextNode(text));
    }
}

function truncateString(string, length = 20) {
    if (string.length <= length) {
        return string;
    }

    return string.slice(0, length) + "...";
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function toText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function random(n) {
    return (Math.floor(Math.random() * n + 1));
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
