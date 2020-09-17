// document ready
$(function() {
    // init UI; listen for storage changes
    browser.storage.local.get().then(initUI, onError);
    browser.storage.onChanged.addListener(updateUI);

    dataI18n();

    $(".signaturesAdd").click(() => {
        addSignature();
    });

    $("#defaultActionNothing").click(() => {
        storeDefaultAction("");
    });
    $("#defaultActionInsert").click(() => {
        storeDefaultAction("insert");
    });
    $("#defaultActionOff").click(() => {
        storeDefaultAction("off");
    });
});

function newSignature() {
    return {
        id: uuidv4(),
        name: i18n("optionsSignatureNewName"),
        text: "",
        html: ""
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
        html: signature.html,
        title: i18n("optionsSignatureEditModalTitle"),
        nameLabel: i18n("optionsSignatureEditModalName"),
        namePlaceholder: i18n("optionsSignatureEditModalNamePlaceholder"),
        textHeading: i18n("optionsSignatureEditModalPlaintext"),
        htmlHeading: i18n("optionsSignatureEditModalHtml"),
        close: i18n("optionsSignatureEditModalClose"),
        save: i18n("optionsSignatureEditModalSave")
    }));

    $("#signatureModalSave-" + signature.id).click(() => {
        storeSignature({
            id: signature.id,
            name: $("#signatureModalName-" + signature.id).val(),
            text: $("#signatureModalText-" + signature.id).val(),
            html: $("#signatureModalHtml-" + signature.id).val()
        });
        $("#signatureEditModal-" + signature.id).modal("hide");
    });

    signatureModals.append(Mustache.render(SIGNATURE_REMOVE_MODAL, {
        id: signature.id,
        title: i18n("optionsSignatureRemoveModalTitle"),
        question: i18n("optionsSignatureRemoveModalQuestion"),
        no: i18n("optionsSignatureRemoveModalNo"),
        yes: i18n("optionsSignatureRemoveModalYes")
    }));

    $("#signatureRemoveModalSave-" + signature.id).click(() => {
        deleteSignature(signature.id, function () {
            $("#signatureRemoveModal-" + signature.id).modal("hide");
            reloadUI();
        });
    });
}

async function initUI(localStorage) {
    if (localStorage) {
        if (localStorage.signatures) {
            localStorage.signatures.forEach(signature => {
                addSignature(signature);
            });
        }

        if (localStorage.defaultSignature) {
            $("#signatureDefault-" + localStorage.defaultSignature).prop("checked", true);
        }

        if (localStorage.defaultAction) {
            switch (localStorage.defaultAction) {
                case "insert":
                    $("#defaultActionInsert").prop("checked", true);
                    break;
                case "off":
                    $("#defaultActionOff").prop("checked", true);
                    break;
                default:
                    $("#defaultActionNothing").prop("checked", true);
            }
        } else {
            $("#defaultActionNothing").prop("checked", true);
        }
    }

    // TODO
    // Temporary workaround until this issue is fixed:
    //    https://developer.thunderbird.net/add-ons/updating/tb78#replacing-options
    //
    // browser.commands.getAll().then(commands => {
    (await browser.runtime.getBackgroundPage()).browser.commands.getAll().then(commands => {
        const commandsContainer = $("#commandsContainer");

        for (let command of commands) {
            switch (command.name) {
                case "switch":
                    commandsContainer.append(Mustache.render(COMMAND_ROW, {
                        id: command.name,
                        label: i18n("optionsSwitchCommandLabel"),
                        value: command.shortcut,
                        placeholder: i18n("optionsCommandPlaceholder"),
                        resetButtonText: i18n("optionsCommandResetButton")
                    }));
                    break;
                case "next":
                    commandsContainer.append(Mustache.render(COMMAND_ROW, {
                        id: command.name,
                        label: i18n("optionsNextCommandLabel"),
                        value: command.shortcut,
                        placeholder: i18n("optionsCommandPlaceholder"),
                        resetButtonText: i18n("optionsCommandResetButton")
                    }));
                    break;
                case "previous":
                    commandsContainer.append(Mustache.render(COMMAND_ROW, {
                        id: command.name,
                        label: i18n("optionsPreviousCommandLabel"),
                        value: command.shortcut,
                        placeholder: i18n("optionsCommandPlaceholder"),
                        resetButtonText: i18n("optionsCommandResetButton")
                    }));
                    break;
            }

            let commandInput = $("#command-" + command.name);
            commandInput.keyup(() => {
                storeCommand(command.name, commandInput.val()).then(() => {
                    commandInput.removeClass("is-invalid").addClass("is-valid");
                }, () => {
                    commandInput.removeClass("is-valid").addClass("is-invalid");
                })
            });

            $("#command-" + command.name + "-reset").click(() => {
                resetCommand(command.name);
                commandInput.removeClass("is-invalid").removeClass("is-valid");
            });
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

function storeDefaultAction(action) {
    browser.storage.local.get().then(localStorage => {
        if (!localStorage.defaultAction) {
            localStorage = {...localStorage, defaultAction: action};
        } else {
            localStorage.defaultAction = action;
        }

        browser.storage.local.set(localStorage);
    });
}

async function storeCommand(name, shortcut) {
    // TODO
    // Temporary workaround until this issue is fixed:
    //    https://developer.thunderbird.net/add-ons/updating/tb78#replacing-options
    //
    // browser.commands.update({
    return (await browser.runtime.getBackgroundPage()).browser.commands.update({
        name: name,
        shortcut: shortcut
    });
}

async function resetCommand(name) {
    // TODO
    // Temporary workaround until this issue is fixed:
    //    https://developer.thunderbird.net/add-ons/updating/tb78#replacing-options
    //
    // browser.commands.reset(name);
    await (await browser.runtime.getBackgroundPage()).browser.commands.reset(name);
    // browser.commands.getAll().then(commands => {
    (await browser.runtime.getBackgroundPage()).browser.commands.getAll().then(commands => {
        for (let command of commands) {
            if (command.name === name) {
                $("#command-" + name).val(command.shortcut);
            }
        }
    });
}

function i18n(key) {
    return browser.i18n.getMessage(key);
}
