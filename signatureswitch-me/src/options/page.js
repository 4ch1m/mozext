// document ready
$(function() {
    // init UI; listen for storage changes
    browser.storage.local.get().then(initUI, onError);
    browser.storage.onChanged.addListener(updateUI);

    dataI18n();

    // --------------------------------------------------
    $(".signaturesAdd").click(() => {
        addSignature();
    });
    // --------------------------------------------------
    $("#defaultActionNothing").click(() => {
        storeDefaultAction("");
    });
    $("#defaultActionInsert").click(() => {
        storeDefaultAction("insert");
    });
    $("#defaultActionOff").click(() => {
        storeDefaultAction("off");
    });
    // --------------------------------------------------
    let importExportData = $("#importExportData");
    importExportData.on("change keyup", () => {
        validateImportExportData();
    });
    $("#importConfirmation").click(() => {
        importSignaturesFromJsonString(importExportData.val());
        $("#importConfirmationModal").modal("hide");
    });
    $("#copySignaturesToClipboard").click(() => {
        copyTextToClipboard(importExportData.val());
    });
    $("#exportSignatures").click(() => {
        loadAndShowSignaturesAsJsonString();
    });
    $("#optionsImportExportDataTooltip").attr("title", i18n("optionsImportExportDataTooltip"));
});

function newSignature() {
    return {
        id: uuidv4(),
        name: i18n("optionsSignatureNewName"),
        text: "",
        html: "",
        autoSwitch: ""
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

    let signatureModals = $("#signatureModals");

    // edit modal ...
    signatureModals.append(Mustache.render(SIGNATURE_EDIT_MODAL, {
        id: signature.id,
        name: signature.name,
        text: signature.text,
        html: signature.html,
        autoSwitch: signature.autoSwitch,
        title: i18n("optionsSignatureEditModalTitle"),
        nameLabel: i18n("optionsSignatureEditModalName"),
        nameTooltip: i18n("optionsSignatureEditModalNameTooltip"),
        namePlaceholder: i18n("optionsSignatureEditModalNamePlaceholder"),
        contentLabel: i18n("optionsSignatureEditModalContent"),
        contentTooltip: i18n("optionsSignatureEditModalContentTooltip"),
        textHeading: i18n("optionsSignatureEditModalPlaintext"),
        htmlHeading: i18n("optionsSignatureEditModalHtml"),
        autoSwitchLabel: i18n("optionsSignatureEditModalAutoSwitch"),
        autoSwitchTooltip: i18n("optionsSignatureEditModalAutoSwitchTooltip"),
        autoSwitchPlaceholder: i18n("optionsSignatureEditModalAutoSwitchPlaceholder"),
        close: i18n("optionsSignatureEditModalClose"),
        save: i18n("optionsSignatureEditModalSave")
    }));
    $("#signatureModalSave-" + signature.id).click(() => {
        storeSignature({
            id: signature.id,
            name: $("#signatureModalName-" + signature.id).val(),
            text: $("#signatureModalText-" + signature.id).val(),
            html: $("#signatureModalHtml-" + signature.id).val(),
            autoSwitch: $("#signatureModalAutoSwitch-" + signature.id).val()
        });
        $("#signatureEditModal-" + signature.id).modal("hide");
    });

    // remove modal ...
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
        // build signatures (tablerows + modals)
        if (localStorage.signatures) {
            localStorage.signatures.forEach(signature => {
                addSignature(signature);
            });
        }

        // default signature
        if (localStorage.defaultSignature) {
            $("#signatureDefault-" + localStorage.defaultSignature).prop("checked", true);
        }

        // default action
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

        // init tooltips
        $('[data-toggle="tooltip"]').tooltip();
    }

    // TODO
    // Temporary workaround until this issue is fixed:
    //    https://developer.thunderbird.net/add-ons/updating/tb78#replacing-options
    //
    // browser.commands.getAll().then(commands => {
    (await browser.runtime.getBackgroundPage()).browser.commands.getAll().then(commands => {
        let commandsContainer = $("#commandsContainer");

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

function storeSignatures(signatures) {
    browser.storage.local.get().then(localStorage => {
        if (!localStorage.signatures) {
            localStorage = {...localStorage, signatures: signatures};
        } else {
            localStorage.signatures = signatures;
        }

        browser.storage.local.set(localStorage);
    });
}

function reorderSignatures(id, direction) {
    if (direction === "up") {
        let row = $("#signatureUp-" + id).parents("tr");

        if (row.index() === 0) {
            return;
        }

        row.prev().before(row.get(0));
    } else {
        let row = $("#signatureDown-" + id).parents("tr");
        let tableSize = $("#signaturesTable tr").length;

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

function importSignaturesFromJsonString(jsonString) {
    try {
        storeSignatures(JSON.parse(jsonString));
        $('#importSuccessModal').modal('show');
    } catch(e) {
        console.log("unable to store signatures. probably invalid json-string.");
    }
}

function loadAndShowSignaturesAsJsonString() {
    browser.storage.local.get().then(localStorage => {
        if (localStorage.signatures) {
            $("#importExportData").val(JSON.stringify(localStorage.signatures, null, 2));
            validateImportExportData();
        }
    });
}

function copyTextToClipboard(text, callback) {
    let promise = navigator.clipboard.writeText(text);

    if (callback) {
        promise.then(callback());
    }
}

function validateImportExportData() {
    let importExportData = $("#importExportData").val();
    let importExportDataValidation = $("#importExportDataValidation");
    let importSignaturesButton = $("#importSignatures");

    let success = true;

    try {
        let signatures = JSON.parse(importExportData);

        if (signatures.length > 0) {
            for (let signature of signatures) {
                if (! ( signature.hasOwnProperty("id")    &&
                        signature.hasOwnProperty("name")  &&
                       (signature.hasOwnProperty("text") || signature.hasOwnProperty("html")))) {
                    throw "missing signature-attributes!"
                }
            }
        } else {
            success = false;
        }
    } catch(e) {
        success = false;
    }

    importExportDataValidation.text(success ? i18n("optionsImportExportValidationSuccess") : i18n("optionsImportExportValidationFailure"));
    importExportDataValidation.removeClass(success ? "text-danger" : "text-success").addClass(success ? "text-success" : "text-danger");
    importSignaturesButton.prop("disabled", !success);
}
