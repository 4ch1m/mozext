// document ready
$(function() {
    // init UI; listen for storage changes
    browser.storage.local.get().then(initUI, onError);
    browser.storage.onChanged.addListener(updateUI);

    dataI18n();

    $(".signaturesAdd").click(() => {
        addSignature();
    });
});

function newSignature() {
    return {
        id: uuidv4(),
        name: browser.i18n.getMessage("optionsSignatureNewName"),
        text: ""
    };
}

function addSignature(signature) {
    if (!signature) {
        signature = newSignature();
    }

    $("#signaturesTableBody").append(Mustache.render(SIGNATURE_ROW, {
        id: signature.id,
        name: signature.name
    }));

    $("#signatureDefault-" + signature.id).click(() => {
        storeDefaultSignature(signature.id);
    });

    $("#signatureUp-" + signature.id).click(() => {
        reorderSignatures(signature.id, "up")
    })

    $("#signatureDown-" + signature.id).click(() => {
        reorderSignatures(signature.id, "down")
    })

    const signatureModals = $("#signatureModals");

    signatureModals.append(Mustache.render(SIGNATURE_EDIT_MODAL, {
        id: signature.id,
        name: signature.name,
        text: signature.text,
        title: browser.i18n.getMessage("optionsSignatureEditModalTitle"),
        nameLabel: browser.i18n.getMessage("optionsSignatureEditModalName"),
        namePlaceholder: browser.i18n.getMessage("optionsSignatureEditModalNamePlaceholder"),
        textLabel: browser.i18n.getMessage("optionsSignatureEditModalText"),
        close: browser.i18n.getMessage("optionsSignatureEditModalClose"),
        save: browser.i18n.getMessage("optionsSignatureEditModalSave")
    }));

    $("#signatureModalSave-" + signature.id).click(() => {
        storeSignature({
            id: signature.id,
            name: $("#signatureModalName-" + signature.id).val(),
            text: $("#signatureModalText-" + signature.id).val()
        });
        $("#signatureEditModal-" + signature.id).modal("hide");
    });

    signatureModals.append(Mustache.render(SIGNATURE_REMOVE_MODAL, {
        id: signature.id,
        title: browser.i18n.getMessage("optionsSignatureRemoveModalTitle"),
        question: browser.i18n.getMessage("optionsSignatureRemoveModalQuestion"),
        no: browser.i18n.getMessage("optionsSignatureRemoveModalNo"),
        yes: browser.i18n.getMessage("optionsSignatureRemoveModalYes")
    }));

    $("#signatureRemoveModalSave-" + signature.id).click(() => {
        deleteSignature(signature.id, function () {
            $("#signatureRemoveModal-" + signature.id).modal("hide");
            reloadUI();
        });
    });
}

function initUI(localStorage) {
    // signatures
    if (localStorage) {
        if (localStorage.signatures) {
            localStorage.signatures.forEach(signature => {
                addSignature(signature);
            });
        }

        if (localStorage.defaultSignature) {
            $("#signatureDefault-" + localStorage.defaultSignature).prop("checked", true);
        }
    }

    // commands
    browser.commands.getAll().then((commands) => {
        const commandsContainer = $("#commandsContainer");

        for (let command of commands) {
            switch (command.name) {
                case "switch":
                    commandsContainer.append(Mustache.render(COMMAND_ROW, {
                        id: command.name,
                        label: browser.i18n.getMessage("optionsSwitchCommandLabel"),
                        value: command.shortcut,
                        placeholder: browser.i18n.getMessage("optionsCommandPlaceholder"),
                        resetButtonText: browser.i18n.getMessage("optionsCommandResetButton")
                    }));
                    break;
                case "next":
                    commandsContainer.append(Mustache.render(COMMAND_ROW, {
                        id: command.name,
                        label: browser.i18n.getMessage("optionsNextCommandLabel"),
                        value: command.shortcut,
                        placeholder: browser.i18n.getMessage("optionsCommandPlaceholder"),
                        resetButtonText: browser.i18n.getMessage("optionsCommandResetButton")
                    }));
                    break;
                case "previous":
                    commandsContainer.append(Mustache.render(COMMAND_ROW, {
                        id: command.name,
                        label: browser.i18n.getMessage("optionsPreviousCommandLabel"),
                        value: command.shortcut,
                        placeholder: browser.i18n.getMessage("optionsCommandPlaceholder"),
                        resetButtonText: browser.i18n.getMessage("optionsCommandResetButton")
                    }));
                    break;
                default:
                    $("#command-" + command.name).change(() => {
                        storeCommand(command.name, $("#command-" + command.name).val());
                    });
                    $("#command-" + command.name + "-reset").click(() => {
                        resetCommand(command.name);
                    });
            }
        }
    });
}

function updateUI() {
    // update signature names
    browser.storage.local.get().then(localStorage => {
        localStorage.signatures.forEach(signature => {
            $("#signatureName-" + signature.id).text(signature.name);
        });
    });
}

function reloadUI() {
    browser.tabs.reload(optionsTabId);
}

function onError(e) {
    console.error(e);
}

function storeSignature(signature) {
    if (!signature) {
        return;
    }

    browser.storage.local.get().then(localStorage => {
        if (!localStorage.signatures) {
            localStorage = {...localStorage, signatures: [signature]};
        } else {
            let updatedSignatures = [];
            let existingUpdated = false;

            localStorage.signatures.forEach(storedSignature => {
                if (storedSignature.id === signature.id) {
                    updatedSignatures.push(signature);
                    existingUpdated = true;
                } else {
                    updatedSignatures.push(storedSignature);
                }
            });

            if (existingUpdated === false) {
                updatedSignatures.push(signature);
            }

            localStorage.signatures = updatedSignatures;
        }

        browser.storage.local.set(localStorage);
    });
}

function deleteSignature(id, onSuccess) {
    browser.storage.local.get().then(localStorage => {
        if (localStorage.signatures) {
            let updatedSignatures = [];

            localStorage.signatures.forEach(storedSignature => {
                if (storedSignature.id !== id) {
                    updatedSignatures.push(storedSignature);
                }
            });

            localStorage.signatures = updatedSignatures;
        }

        browser.storage.local.set(localStorage).then(() => {
            if (onSuccess !== undefined) {
                onSuccess();
            }
        });
    });
}

function reorderSignatures(id, direction) {
    if (direction === "up") {
        const row = $("#signatureUp-" + id).parents("tr");

        if (row.index() === 0) {
            return;
        }

        row.prev().before(row.get(0));
    } else {
        const row = $("#signatureDown-" + id).parents("tr");
        const tableSize = $("#signaturesTable tr").length;

        if (row.index() === (tableSize - 2)) {
            return;
        }

        row.next().after(row.get(0));
    }

    browser.storage.local.get().then(localStorage => {
        if (!localStorage.signatures) {
            return;
        }

        let signatures = localStorage.signatures;
        let signatureIndex = -1;

        for (let i = 0; i < signatures.length; i++) {
            if (signatures[i].id === id) {
                signatureIndex = i;
                break;
            }
        }

        if (signatureIndex > -1) {
            localStorage.signatures = arrayMove(localStorage.signatures, signatureIndex, (direction === "up" ? signatureIndex - 1 : signatureIndex + 1));
            browser.storage.local.set(localStorage);
        }
    });
}

function storeDefaultSignature(id) {
    browser.storage.local.get().then(localStorage => {
        if (!localStorage.defaultSignature) {
            localStorage = {...localStorage, defaultSignature: id};
        } else {
            localStorage.defaultSignature = id;
        }

        browser.storage.local.set(localStorage);
    });
}

function storeCommand(name, shortcut) {
    browser.commands.update({
        name: name,
        shortcut: shortcut
    });
}

function resetCommand(name) {
    browser.commands.reset(name);
    browser.commands.getAll().then((commands) => {
        for (let command of commands) {
            if (command.name === name) {
                $("#command-" + name).val(command.shortcut);
            }
        }
    });
}
