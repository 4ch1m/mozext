// document ready
$(function() {
    // init UI; listen for storage changes
    browser.storage.local.get().then(initUI);
    browser.storage.onChanged.addListener(updateUI);

    dataI18n();

    // --------------------------------------------------
    $(".signaturesAdd").click(() => {
        addSignature();
    });
    $(".imagesAdd").click(() => {
        addImage();
    });
    // --------------------------------------------------
    $("#defaultActionNothing").click(() => {
        addOrUpdateStoredValue("defaultAction", "");
    });
    $("#defaultActionInsert").click(() => {
        addOrUpdateStoredValue("defaultAction", "insert");
    });
    $("#defaultActionOff").click(() => {
        addOrUpdateStoredValue("defaultAction", "off");
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
    $("#importExportDataTooltip").attr("title", i18n("optionsImportExportDataTooltip"));
});

/* =====================================================================================================================
   new object creation ...
 */

function newSignature() {
    return {
        id: uuidv4(),
        name: i18n("optionsSignatureNewName"),
        text: "",
        html: "",
        autoSwitch: ""
    };
}

function newImage() {
    return {
        id: uuidv4(),
        name: "",
        tag: "",
        type: "png",
        data: ""
    };
}

/* =====================================================================================================================
   UI operations ...
 */

async function initUI(localStorage) {
    if (localStorage) {
        let signatureIds = [];

        // build signatures (tablerows + modals) ...
        if (localStorage.signatures) {
            localStorage.signatures.forEach(signature => {
                signatureIds.push(signature.id);
                addSignature(signature);
            });
        }

        // default signature ...
        let actualDefaultSignature = "";
        if (localStorage.defaultSignature) {
            // check if stored defaultSignatureId actually still exists
            if (signatureIds.some(id => id === localStorage.defaultSignature)) {
                actualDefaultSignature = localStorage.defaultSignature;
            }
        }
        if (signatureIds.length > 0) {
            if (actualDefaultSignature === "") {
                // if the stored defaultSignatureId doesn't exist anymore or (for whatever reason) never got stored;
                // simply use the first one as default and store it now
                actualDefaultSignature = signatureIds[0];
                addOrUpdateStoredValue("defaultSignature", actualDefaultSignature);
            }
            $("#signatureDefault-" + actualDefaultSignature).prop("checked", true);
        }

        // build images (tablerows + modals) ...
        if (localStorage.images) {
            localStorage.images.forEach(image => {
                addImage(image);
            });
        }

        // default action ...
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

        // replies ...
        let repliesDisableAutoSwitch = $("#repliesDisableAutoSwitch");
        repliesDisableAutoSwitch.prop("checked", localStorage.repliesDisableAutoSwitch ? localStorage.repliesDisableAutoSwitch : false);
        repliesDisableAutoSwitch.click(() => {
            addOrUpdateStoredValue("repliesDisableAutoSwitch", repliesDisableAutoSwitch.prop("checked"));
        });
        let repliesNoDefaultAction = $("#repliesNoDefaultAction");
        repliesNoDefaultAction.prop("checked", localStorage.repliesNoDefaultAction ? localStorage.repliesNoDefaultAction : false);
        repliesNoDefaultAction.click(() => {
            addOrUpdateStoredValue("repliesNoDefaultAction", repliesNoDefaultAction.prop("checked"));
        });
        let repliesSubjectIndicators = $("#repliesSubjectIndicators");
        repliesSubjectIndicators.attr("placeholder", i18n("optionsRepliesSubjectIndicatorsPlaceholder"));
        repliesSubjectIndicators.val(localStorage.repliesSubjectIndicators ? localStorage.repliesSubjectIndicators : /* default: */ "Re,RE,AW,Aw,Antwort,VS,Vs,SV,Sv,Svar");
        repliesSubjectIndicators.keyup(() => {
            addOrUpdateStoredValue("repliesSubjectIndicators", repliesSubjectIndicators.val());
        });

        // init tooltips ...
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
                updateCommand(command.name, commandInput.val()).then(() => {
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

function addSignature(signature) {
    if (!signature) {
        signature = newSignature();
    }

    $("#signaturesTableBody").append(Mustache.render(SIGNATURE_ROW, {
        id: signature.id,
        name: signature.name
    }));

    $("#signatureDefault-" + signature.id).click(() => {
        addOrUpdateStoredValue("defaultSignature", signature.id);
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
        addOrUpdateItemInStoredArray({
            id: signature.id,
            name: $("#signatureModalName-" + signature.id).val(),
            text: $("#signatureModalText-" + signature.id).val(),
            html: $("#signatureModalHtml-" + signature.id).val(),
            autoSwitch: $("#signatureModalAutoSwitch-" + signature.id).val()
        }, "signatures");
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
    $("#signatureRemoveModalYes-" + signature.id).click(() => {
        deleteItemFromStoredArrayViaId(signature.id, "signatures", function () {
            $("#signatureRemoveModal-" + signature.id).modal("hide");
            $(`tr[data-signature-id="${signature.id}"]`).remove();
        });
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

function addImage(image) {
    if (!image) {
        image = newImage();
    }

    // table row ...
    let imageData = undefined;
    if (image.data) {
        if (image.data !== "") {
            imageData = image.data;
        }
    }
    $("#imagesTableBody").append(Mustache.render(IMAGES_ROW, {
        id: image.id,
        name: image.name,
        namePlaceholder: i18n("optionsTableColumnImagesNamePlaceholder"),
        tag: image.tag,
        tagPlaceholder: i18n("optionsTableColumnImagesTagPlaceholder"),
        data: imageData
    }));
    $("#imageDisplay-" + image.id).attr("alt", i18n("optionsImageDisplayAlt"));

    // modals ...
    $("#imageModals").append(Mustache.render(IMAGE_REMOVE_MODAL, {
        id: image.id,
        title: i18n("optionsImageRemoveModalTitle"),
        question: i18n("optionsImageRemoveModalQuestion"),
        no: i18n("optionsImageRemoveModalNo"),
        yes: i18n("optionsImageRemoveModalYes")
    }));
    $("#imageRemoveModalYes-" + image.id).click(() => {
        deleteItemFromStoredArrayViaId(image.id, "images", function () {
            $("#imageRemoveModal-" + image.id).modal("hide");
            $(`tr[data-image-id="${image.id}"]`).remove();
        });
    });

    let updatedImage = () => {
        return {
            id: image.id,
            name: $("#imageName-" + image.id).val(),
            tag: $("#imageTag-" + image.id).val(),
            data: $("#imageDisplay-" + image.id).attr("src")
        };
    };

    // input-/change-listeners ...
    $(`#imageName-${image.id}, #imageTag-${image.id}`).on("change keyup", () => {
        addOrUpdateItemInStoredArray(updatedImage(), "images")
    });
    $("#imageFileInput-" + image.id).change(async (e) => {
        $("#imageDisplay-" + image.id).attr("src", await toBase64(e.target.files[0]));
        addOrUpdateItemInStoredArray(updatedImage(), "images")
    });
}

function loadAndShowSignaturesAsJsonString() {
    browser.storage.local.get().then(localStorage => {
        if (localStorage.signatures) {
            $("#importExportData").val(JSON.stringify(localStorage.signatures, null, 2));
            validateImportExportData();
        }
    });
}

function importSignaturesFromJsonString(jsonString) {
    try {
        addOrUpdateStoredValue("signatures", JSON.parse(jsonString));
        $('#importSuccessModal').modal('show');
    } catch(e) {
        console.log("unable to store signatures. probably invalid json-string.");
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

/* =====================================================================================================================
   abstracted storage operations ...
 */

function addOrUpdateStoredValue(keyName, value) {
    browser.storage.local.get().then(localStorage => {
        if (!localStorage[keyName]) {
            localStorage = {...localStorage, [keyName]: value};
        } else {
            localStorage[keyName] = value;
        }

        browser.storage.local.set(localStorage);
    });
}

function addOrUpdateItemInStoredArray(item, arrayName) {
    if (!item) {
        return;
    }

    browser.storage.local.get().then(localStorage => {
        if (!localStorage[arrayName]) {
            localStorage = {...localStorage, [arrayName]: [item]};
        } else {
            let updatedArray = [];
            let existingUpdated = false;

            localStorage[arrayName].forEach(storedItem => {
                if (storedItem.id === item.id) {
                    updatedArray.push(item);
                    existingUpdated = true;
                } else {
                    updatedArray.push(storedItem);
                }
            });

            if (existingUpdated === false) {
                updatedArray.push(item);
            }

            localStorage[arrayName] = updatedArray;
        }

        browser.storage.local.set(localStorage).then(() => {
            if (typeof onSuccess !== "undefined") {
                onSuccess();
            }
        });
    });
}

function deleteItemFromStoredArrayViaId(itemId, arrayName, onSuccess) {
    if (!itemId) {
        return;
    }

    browser.storage.local.get().then(localStorage => {
        if (localStorage[arrayName]) {
            let updatedItems = [];

            localStorage[arrayName].forEach(storedItem => {
                if (storedItem.id !== itemId) {
                    updatedItems.push(storedItem);
                }
            });

            localStorage[arrayName] = updatedItems;
        }

        browser.storage.local.set(localStorage).then(() => {
            if (typeof onSuccess !== "undefined") {
                onSuccess();
            }
        });
    });
}

/* =====================================================================================================================
   misc ...
 */

async function updateCommand(name, shortcut) {
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

function copyTextToClipboard(text, callback) {
    let promise = navigator.clipboard.writeText(text);

    if (callback) {
        promise.then(callback());
    }
}
