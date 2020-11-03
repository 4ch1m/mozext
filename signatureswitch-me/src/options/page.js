const COMMAND_SEPARATOR = "+";
const NEW_LINE = "\n";
const FORTUNE_COOKIE_SEPARATOR =  NEW_LINE + "%" + NEW_LINE;

// document ready
$(function() {
    browser.storage.local.get().then(localStorage => {
        // ensure that default values for bool preferences are set (otherwise would be 'undefined')
        validateDefaultsForBoolPreferences(localStorage, [
            {name: "identitiesSwitchSignatureOnChange", default: false},
            {name: "identitiesUseAssignedSignatureOnReplyOrForwarding", default: false},
            {name: "identitiesOverruleDefaultAction", default: true},
            {name: "repliesDisableAutoSwitch", default: false},
            {name: "repliesNoDefaultAction", default: false},
            {name: "forwardingsDisableAutoSwitch", default: false},
            {name: "forwardingsNoDefaultAction", default: false},
            {name: "signatureSeparatorHtml", default: false}
        ]);

        // init UI; listen for storage changes
        browser.storage.local.get().then(initUI);
        browser.storage.onChanged.addListener(updateUI);
    });
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
        data: /* default placeholder-image: */
                "data:image/png;base64," +
                    "iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9" +
                    "kT1Iw0AcxV9TxQ8qHexQpGCG6mRBVMRRq1CECqVWaNXB5NIvaNKQpLg4Cq4FBz8Wqw4uzro6uAqC" +
                    "4AeIk6OToouU+L+k0CLGg+N+vLv3uHsHCI0KU82ucUDVLCOdiIvZ3KrY84o+hBFEBMMSM/W5VCoJ" +
                    "z/F1Dx9f72I8y/vcn2NAyZsM8InEs0w3LOIN4ulNS+e8TxxiJUkhPiceM+iCxI9cl11+41x0WOCZ" +
                    "ISOTnicOEYvFDpY7mJUMlXiKOKqoGuULWZcVzluc1UqNte7JXxjIayvLXKcZQQKLWEIKImTUUEYF" +
                    "FmK0aqSYSNN+3MM/5PhT5JLJVQYjxwKqUCE5fvA/+N2tWZiccJMCcaD7xbY/RoCeXaBZt+3vY9tu" +
                    "ngD+Z+BKa/urDWDmk/R6W4seAcFt4OK6rcl7wOUOEH7SJUNyJD9NoVAA3s/om3LA4C3Qv+b21trH" +
                    "6QOQoa6SN8DBITBapOx1j3f3dvb275lWfz91qnKoGpcjwAAAAAZiS0dEAAAAAAAA+UO7fwAAAAlw" +
                    "SFlzAAAN1wAADdcBQiibeAAAAAd0SU1FB+QJGA8cLuhB+ZoAAAIHSURBVGje7dk9a1RBFMbx364p" +
                    "VBACFoKFBI0pBFGEdBICGnwtbESwEksLG4l+AD+BpNIigmVa0U6IpSi+oCCorYjYxQjxJbsWzsKw" +
                    "7q53d5O9M3IfONxd7swwf86cc2fmUKlSpUo5qRb9PoLLmMSWxOe9jvdYxIv4xXU00MzM1jHfgjib" +
                    "IUBsDZyq4TFmAtQHLGAt8aW1FVexL/xfhtWI7mhG8T0TzfurNjdNZAQyEc99bIABpoPn6nge3NpM" +
                    "gayoR8bxoEOwPcGesj1SFKSGRz0yx1tsywHkZIE0eKVMkHrBTscKtDleZnwUBdm+QW1KB3lToM3r" +
                    "HLLWOL70iI+1sNlMPthhFisdIL7jYi7pN+68gJdhud3FwRS+7P/NFqWeyKRmcROHRrFF2Sydx8/o" +
                    "bHG/IFBSSyuGaD/5LWF/DiDdIGL7gXvYmypIEYj2FH8bu1MC6Rcitm+4hV3DguzAXHgOogtDQMS2" +
                    "Ejw0EMhkuEtq4iPOlATRzQqBTONzh85L2LnJy2nDQOa67LFa9gnnSob4J8ilkAKLDNTJO6OC6Aly" +
                    "Y4Br1Ng7o4ToCDKGO0MO+nDEEH+BHAh7nezugGttl2vvMCVDtYM0+jjHJ6V6+Oz3exmRmlbreCZ/" +
                    "PYXT8qxWxYWeEy2i+XCYybH0dq0V7C0d9qcYOiX9YuivkGEX8UqlSpUqZaffCw665OhnGKMAAAAA" +
                    "SUVORK5CYII="
    };
}

function newFortuneCookies() {
    return {
        id: uuidv4(),
        name: "",
        tag: "",
        cookies: []
    };
}

/* =====================================================================================================================
   UI operations ...
 */

async function initUI(localStorage) {
    /* -----------
        Signatures
       ------------ */

    let signatureIds = [];

    // build signatures (tablerows + modals)
    if (localStorage.signatures) {
        localStorage.signatures.forEach(signature => {
            signatureIds.push(signature.id);
            addSignature(signature);
        });
    }

    // default signature
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

    // add button
    $(".signaturesAdd").click(() => {
        addSignature();
    });

    /* --------
        Images
       -------- */

    // build images (tablerows + modals)
    if (localStorage.images) {
        localStorage.images.forEach(image => {
            addImage(image);
        });
    }

    // add button
    $(".imagesAdd").click(() => {
        addImage();
    });

    /* -----------------
        Fortune Cookies
       ----------------- */

    // build fortune cookies (tablerows + modals)
    if (localStorage.fortuneCookies) {
        localStorage.fortuneCookies.forEach(fortuneCookies => {
            addFortuneCookies(fortuneCookies);
        });
    }

    // add button
    $(".fortuneCookiesAdd").click(() => {
        addFortuneCookies();
    });

    /* ------------
        Identities
       ------------ */

    // checkboxes
    let identitiesSwitchSignatureOnChange = $("#identitiesSwitchSignatureOnChange");
    identitiesSwitchSignatureOnChange.prop("checked", localStorage.identitiesSwitchSignatureOnChange);
    identitiesSwitchSignatureOnChange.click(() => {
        addOrUpdateStoredValue("identitiesSwitchSignatureOnChange", identitiesSwitchSignatureOnChange.prop("checked"));
    });
    let identitiesUseAssignedSignatureOnReplyOrForwarding = $("#identitiesUseAssignedSignatureOnReplyOrForwarding");
    identitiesUseAssignedSignatureOnReplyOrForwarding.prop("checked", localStorage.identitiesUseAssignedSignatureOnReplyOrForwarding);
    identitiesUseAssignedSignatureOnReplyOrForwarding.click(() => {
        addOrUpdateStoredValue("identitiesUseAssignedSignatureOnReplyOrForwarding", identitiesUseAssignedSignatureOnReplyOrForwarding.prop("checked"));
    });
    let identitiesOverruleDefaultAction = $("#identitiesOverruleDefaultAction");
    identitiesOverruleDefaultAction.prop("checked", localStorage.identitiesOverruleDefaultAction);
    identitiesOverruleDefaultAction.click(() => {
        addOrUpdateStoredValue("identitiesOverruleDefaultAction", identitiesOverruleDefaultAction.prop("checked"));
    });

    // tablerows
    buildIdentitiesTableBody(localStorage);

    // reload-button
    $("#reloadIdentities").click(() => {
        browser.storage.local.get().then(localStorage => {
            buildIdentitiesTableBody(localStorage);
        });
    });

    // tooltip
    $("#identitiesTooltip").attr({
        "data-toggle": "tooltip",
        "title": i18n("optionsIdentitiesTooltip")
    });

    /* ---------------
        Miscellaneous
       --------------- */

    // default action
    let defaultActionNothing = $("#defaultActionNothing");
    let defaultActionInsert = $("#defaultActionInsert");
    let defaultActionOff = $("#defaultActionOff");
    if (localStorage.defaultAction) {
        switch (localStorage.defaultAction) {
            case "insert":
                defaultActionNothing.prop("checked", true);
                break;
            case "off":
                defaultActionInsert.prop("checked", true);
                break;
            default:
                defaultActionOff.prop("checked", true);
        }
    } else {
        defaultActionNothing.prop("checked", true);
    }
    defaultActionNothing.click(() => {
        addOrUpdateStoredValue("defaultAction", "");
    });
    defaultActionInsert.click(() => {
        addOrUpdateStoredValue("defaultAction", "insert");
    });
    defaultActionOff.click(() => {
        addOrUpdateStoredValue("defaultAction", "off");
    });

    // commands
    // TODO
    // Temporary workaround until this issue is fixed:
    //    https://developer.thunderbird.net/add-ons/updating/tb78#replacing-options
    //
    // browser.commands.getAll().then(commands => {
    (await browser.runtime.getBackgroundPage()).browser.commands.getAll().then(commands => {
        let commandsContainer = $("#commandsContainer");

        for (let command of commands) {
            let label = "";
            switch (command.name) {
                case "switch":
                    label = i18n("optionsSwitchCommandLabel");
                    break;
                case "next":
                    label = i18n("optionsNextCommandLabel");
                    break;
                case "previous":
                    label = i18n("optionsPreviousCommandLabel");
                    break;
            }

            let commandValues = command.shortcut.split(COMMAND_SEPARATOR);

            let commandValueCheck = (commandValuesArray, commandValue) => {
                if (typeof commandValuesArray !== "undefined" && commandValuesArray.length > 0 && commandValuesArray[0] === commandValue) {
                    commandValuesArray.shift();
                    return true;
                } else {
                    return false;
                }
            };

            let createOptionElement = (value, selected, text) => {
                return `<option value="${value}" ${selected ? "selected" : ""}>${text}</option>`;
            }

            let modifierOptions1 = "";
            for (let modifier of ["Ctrl", "Alt", "Command", "MacCtrl"]) {
                modifierOptions1 += createOptionElement(modifier, commandValueCheck(commandValues, modifier), modifier);
            }

            let modifierOptions2 = createOptionElement("", false, "");
            for (let modifier of ["Shift", "Ctrl", "Alt", "Command", "MacCtrl"]) {
                modifierOptions2 += createOptionElement(modifier, commandValueCheck(commandValues, modifier), modifier);
            }

            let keyOptions = "";
            // A-Z
            for (let i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++) {
                keyOptions += createOptionElement(String.fromCharCode(i), commandValueCheck(commandValues, String.fromCharCode(i)), String.fromCharCode(i));
            }
            // 0-9
            for (let i = 0; i <= 9; i++) {
                keyOptions += createOptionElement(i, commandValueCheck(commandValues, i), i);
            }
            // F1-F12
            for (let i = 1; i <= 12; i++) {
                keyOptions += createOptionElement("F" + i, commandValueCheck(commandValues, "F" + i), "F" + i);
            }
            /*
                the rest ...

                    - optionsCommandKeyComma
                    - optionsCommandKeyDelete
                    - optionsCommandKeyDown
                    - optionsCommandKeyEnd
                    - optionsCommandKeyHome
                    - optionsCommandKeyInsert
                    - optionsCommandKeyLeft
                    - optionsCommandKeyPageDown
                    - optionsCommandKeyPageUp
                    - optionsCommandKeyPeriod
                    - optionsCommandKeyRight
                    - optionsCommandKeySpace
                    - optionsCommandKeyUp
            */
            for (let key of ["Comma", "Period", "Home", "End", "PageUp", "PageDown", "Space", "Insert", "Delete", "Up", "Down", "Left", "Right"]) {
                keyOptions += createOptionElement(key, commandValueCheck(commandValues, key), i18n("optionsCommandKey" + key));
            }

            commandsContainer.append(Mustache.render(COMMAND_ROW, {
                id: command.name,
                label: label,
                modifierOptions1: modifierOptions1,
                modifierOptions2: modifierOptions2,
                keyOptions: keyOptions,
                resetButtonText: i18n("optionsCommandReset")
            }));

            let modifier1Element = $(`#command-${command.name}-modifier1`);
            let modifier2Element = $(`#command-${command.name}-modifier2`);
            let keyElement = $(`#command-${command.name}-key`);

            let successIcon = $(`#command-${command.name}-success`);
            let failIcon = $(`#command-${command.name}-fail`);

            for (let element of [modifier1Element, modifier2Element, keyElement]) {
                element.change(() => {
                    let elements = [];
                    let selectedModifier1 = modifier1Element.find("option:selected");
                    let selectedModifier2 = modifier2Element.find("option:selected");
                    let selectedKey = keyElement.find("option:selected");

                    if (selectedModifier1.val() !== "") {
                        elements.push(selectedModifier1.val());
                    }
                    if (selectedModifier2.val() !== "") {
                        elements.push(selectedModifier2.val());
                    }
                    if (selectedKey.val() !== "") {
                        elements.push(selectedKey.val());
                    }

                    updateCommand(command.name, elements.join(COMMAND_SEPARATOR)).then(() => {
                        successIcon.removeClass("d-none");
                        failIcon.addClass("d-none");
                    }, () => {
                        failIcon.removeClass("d-none");
                        successIcon.addClass("d-none");
                    })

                })
            }

            $("#command-" + command.name + "-reset").click(() => {
                resetCommand(command.name);
                successIcon.addClass("d-none");
                failIcon.addClass("d-none");
            });
        }
    });

    // replies
    let repliesDisableAutoSwitch = $("#repliesDisableAutoSwitch");
    repliesDisableAutoSwitch.prop("checked", localStorage.repliesDisableAutoSwitch);
    repliesDisableAutoSwitch.click(() => {
        addOrUpdateStoredValue("repliesDisableAutoSwitch", repliesDisableAutoSwitch.prop("checked"));
    });
    let repliesNoDefaultAction = $("#repliesNoDefaultAction");
    repliesNoDefaultAction.prop("checked", localStorage.repliesNoDefaultAction);
    repliesNoDefaultAction.click(() => {
        addOrUpdateStoredValue("repliesNoDefaultAction", repliesNoDefaultAction.prop("checked"));
    });

    // forwardings
    let forwardingsDisableAutoSwitch = $("#forwardingsDisableAutoSwitch");
    forwardingsDisableAutoSwitch.prop("checked", localStorage.forwardingsDisableAutoSwitch);
    forwardingsDisableAutoSwitch.click(() => {
        addOrUpdateStoredValue("forwardingsDisableAutoSwitch", forwardingsDisableAutoSwitch.prop("checked"));
    });
    let forwardingsNoDefaultAction = $("#forwardingsNoDefaultAction");
    forwardingsNoDefaultAction.prop("checked", localStorage.forwardingsNoDefaultAction);
    forwardingsNoDefaultAction.click(() => {
        addOrUpdateStoredValue("forwardingsNoDefaultAction", forwardingsNoDefaultAction.prop("checked"));
    });

    // signature separator
    let signatureSeparatorHtml = $("#signatureSeparatorHtml");
    signatureSeparatorHtml.prop("checked", localStorage.signatureSeparatorHtml);
    signatureSeparatorHtml.click(() => {
        addOrUpdateStoredValue("signatureSeparatorHtml", signatureSeparatorHtml.prop("checked"));
    });

    /* -----------------
        Import / Export
       ----------------- */

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

    // tooltip
    $("#importExportDataTooltip").attr({
        "data-toggle": "tooltip",
        "data-html": "true",
        "title": i18n("optionsImportExportDataTooltip") + `
            <br><br>
            <div class="text-left nobr">
            [<br>
            &nbsp;{<br>
            &nbsp;&nbsp;"id": "666",<br>
            &nbsp;&nbsp;"name": "Business",<br>
            &nbsp;&nbsp;"text": "email: moe@zilla.org"<br>
            &nbsp;}<br>
            ]</div>`
    });

    // init all tooltips
    initTooltips();

    // trigger i18n
    dataI18n();
}

function updateUI(changes) {
    let changedItems = Object.keys(changes);

    for (let item of changedItems) {
        switch (item) {
            case "signatures":
                if (JSON.stringify(changes[item].newValue) !== JSON.stringify(changes[item].oldValue)) {
                    browser.storage.local.get().then(localStorage => {
                        localStorage.signatures.forEach(signature => {
                            $("#signatureName-" + signature.id).text(signature.name);
                        });

                        buildIdentitiesTableBody(localStorage);
                    });
                }
                break;
        }
    }
}

function initTooltips() {
    $('[data-toggle="tooltip"]').tooltip();
}

function addSignature(signature) {
    let immediatelyShowModal = false;

    if (!signature) {
        signature = newSignature();
        immediatelyShowModal = true;
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

    // edit modal
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
        textPlaceholder: i18n("optionsSignatureEditModalTextPlaceholder"),
        htmlHeading: i18n("optionsSignatureEditModalHtml"),
        htmlPlaceholder: i18n("optionsSignatureEditModalHtmlPlaceholder"),
        autoSwitchLabel: i18n("optionsSignatureEditModalAutoSwitch"),
        autoSwitchTooltip: i18n("optionsSignatureEditModalAutoSwitchTooltip"),
        autoSwitchPlaceholder: i18n("optionsSignatureEditModalAutoSwitchPlaceholder"),
        close: i18n("optionsSignatureEditModalClose"),
        save: i18n("optionsSignatureEditModalSave")
    }));
    let signatureEditModal = $("#signatureEditModal-" + signature.id);
    $("#signatureModalSave-" + signature.id).click(() => {
        addOrUpdateItemInStoredArray({
            id: signature.id,
            name: $("#signatureModalName-" + signature.id).val(),
            text: $("#signatureModalText-" + signature.id).val(),
            html: $("#signatureModalHtml-" + signature.id).val(),
            autoSwitch: $("#signatureModalAutoSwitch-" + signature.id).val()
        }, "signatures");
        signatureEditModal.modal("hide");
    });
    initTooltips();

    // remove modal
    signatureModals.append(Mustache.render(GENERIC_REMOVE_MODAL, {
        modalId: "signatureRemoveModal-" + signature.id,
        modalYesButtonId: "signatureRemoveModalYes-" + signature.id,
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

    if (immediatelyShowModal) {
        signatureEditModal.modal("show");
    }
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
    let fileInputClass = "color-transparent"; /* hide filename-label on input-element per default */

    if (!image) {
        fileInputClass = ""; /* if it's a brand new image (added via gui) show the label */
        image = newImage();
    }

    // table row
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
        data: imageData,
        class: fileInputClass
    }));

    // modals
    $("#imageModals").append(Mustache.render(GENERIC_REMOVE_MODAL, {
        modalId: "imageRemoveModal-" + image.id,
        modalYesButtonId: "imageRemoveModalYes-" + image.id,
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

    // input-/change-listeners
    $(`#imageName-${image.id}, #imageTag-${image.id}`).on("change keyup", () => {
        addOrUpdateItemInStoredArray(updatedImage(), "images")
    });
    $("#imageFileInput-" + image.id).change(async (e) => {
        $("#imageDisplay-" + image.id).attr("src", await toBase64(e.target.files[0]));
        addOrUpdateItemInStoredArray(updatedImage(), "images")
    });
}

function addFortuneCookies(fortuneCookies) {
    if (!fortuneCookies) {
        fortuneCookies = newFortuneCookies();
    }

    $("#fortuneCookiesTableBody").append(Mustache.render(FORTUNE_COOKIES_ROW, {
        id: fortuneCookies.id,
        name: fortuneCookies.name,
        namePlaceholder: i18n("optionsTableColumnFortuneCookiesNamePlaceholder"),
        tag: fortuneCookies.tag,
        tagPlaceholder: i18n("optionsTableColumnFortuneCookiesTagPlaceholder"),
        cookies: fortuneCookies.cookies.join(FORTUNE_COOKIE_SEPARATOR)
    }));

    let fortuneCookiesModals = $("#fortuneCookiesModals");
    let fortuneCookiesTableRowTextarea = $("#fortuneCookiesCookies-" + fortuneCookies.id);

    // edit modal
    fortuneCookiesModals.append(Mustache.render(FORTUNE_COOKIES_EDIT_MODAL, {
        id: fortuneCookies.id,
        title: i18n("optionsFortuneCookiesEditModalTitle"),
        cookiesLabel: i18n("optionsFortuneCookiesEditModalLabel"),
        cookiesTooltip: i18n("optionsFortuneCookiesEditModalTooltip"),
        cookiesPlaceholder: i18n("optionsFortuneCookiesEditModalPlaceholder"),
        cookies: fortuneCookies.cookies.join(FORTUNE_COOKIE_SEPARATOR),
        fileImportLabel: i18n("optionsFortuneCookiesEditModalFileImport"),
        close: i18n("optionsFortuneCookiesEditModalClose"),
        save: i18n("optionsFortuneCookiesEditModalSave")
    }));
    let fortuneCookiesEditModal = $("#fortuneCookiesEditModal-" + fortuneCookies.id);
    let fortuneCookiesEditModalTextarea = $("#fortuneCookiesEditModalCookies-" + fortuneCookies.id);
    fortuneCookiesTableRowTextarea.on("click keydown", () => {
        fortuneCookiesEditModal.modal("show");
    });
    $("#fortuneCookiesEditModalSave-" + fortuneCookies.id).click(() => {
        fortuneCookiesTableRowTextarea.val(fortuneCookiesEditModalTextarea.val());
        fortuneCookiesTableRowTextarea.change();
        fortuneCookiesEditModal.modal("hide");
    });
    initTooltips();

    // remove modal
    fortuneCookiesModals.append(Mustache.render(GENERIC_REMOVE_MODAL, {
        modalId: "fortuneCookiesRemoveModal-" + fortuneCookies.id,
        modalYesButtonId: "fortuneCookiesRemoveModalYes-" + fortuneCookies.id,
        id: fortuneCookies.id,
        title: i18n("optionsFortuneCookiesRemoveModalTitle"),
        question: i18n("optionsFortuneCookiesRemoveModalQuestion"),
        no: i18n("optionsFortuneCookiesRemoveModalNo"),
        yes: i18n("optionsFortuneCookiesRemoveModalYes")
    }));
    $("#fortuneCookiesRemoveModalYes-" + fortuneCookies.id).click(() => {
        deleteItemFromStoredArrayViaId(fortuneCookies.id, "fortuneCookies", function () {
            $("#fortuneCookiesRemoveModal-" + fortuneCookies.id).modal("hide");
            $(`tr[data-fortunecookies-id="${fortuneCookies.id}"]`).remove();
        });
    });

    let updatedFortuneCookies = () => {
        return {
            id: fortuneCookies.id,
            name: $("#fortuneCookiesName-" + fortuneCookies.id).val(),
            tag: $("#fortuneCookiesTag-" + fortuneCookies.id).val(),
            cookies: $("#fortuneCookiesCookies-" + fortuneCookies.id).val().split(FORTUNE_COOKIE_SEPARATOR)
        };
    };

    // input-/change-listeners
    $(`#fortuneCookiesName-${fortuneCookies.id}, #fortuneCookiesTag-${fortuneCookies.id}, #fortuneCookiesCookies-${fortuneCookies.id}`).on("change keyup", () => {
        addOrUpdateItemInStoredArray(updatedFortuneCookies(), "fortuneCookies")
    });
    $("#fortuneCookiesFileInput-" + fortuneCookies.id).change(async (e) => {
        fortuneCookiesEditModalTextarea.val(await toText(e.target.files[0]));
    });
}

function buildIdentitiesTableBody(localStorage) {
    // get all existing signature ids first
    getAllSignatureIds(localStorage.signatures).then(allSignatureIds => {
        // helper-function to get the the already assigned sig-id of an identity
        let getAssignedSignatureIdForMailIdentityId = mailIdentityId => {
            let signatureId = "";
            if (localStorage.identities) {
                let identities = localStorage.identities;
                for (let i = 0; i < identities.length; i++) {
                    if (identities[i].id === mailIdentityId) {
                        if (allSignatureIds.includes(identities[i].signatureId)) {
                            signatureId = identities[i].signatureId;
                            break;
                        }
                    }
                }
            }

            return signatureId;
        };

        // clear table body
        let tableBody = $("#identitiesTableBody");
        tableBody.empty();

        // get all mail accounts
        browser.accounts.list().then(mailAccounts => {
            // iterate over all mail accounts
            for (let mailAccount of mailAccounts) {
                for (let mailIdentity of mailAccount.identities) {
                    let assignedSignature = getAssignedSignatureIdForMailIdentityId(mailIdentity.id);
                    let optionItems = "<option></option>"; // = no selection

                    // create options for select element
                    if (localStorage.signatures) {
                        localStorage.signatures.forEach(signature => {
                            optionItems += `<option value="${signature.id}" ${assignedSignature === signature.id ? "selected" : ""}>${signature.name}</option>`
                        });
                    }

                    // append a new "identity row" to the table
                    tableBody.append(Mustache.render(IDENTITIES_ROW, {
                        id: mailIdentity.id,
                        name: `${mailIdentity.name} <${mailIdentity.email}>`,
                        signatures: optionItems
                    }));

                    // change-listener for the select element
                    let identitySignature = $(`#identity-${mailIdentity.id}-signature`);
                    identitySignature.change(() => {
                        addOrUpdateItemInStoredArray({id: mailIdentity.id, signatureId: identitySignature.find("option:selected").val()} , "identities");
                    });
                }
            }
        });
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
        $("#importSuccessModal").modal("show");
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
                if ( !( signature.hasOwnProperty("id")    &&
                        signature.hasOwnProperty("name")  &&
                        (signature.hasOwnProperty("text") || signature.hasOwnProperty("html"))) ) {
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
                // TODO refactor - this will only work if the default command consists of three values
                let commandValues = command.shortcut.split(COMMAND_SEPARATOR);
                $(`#command-${command.name}-modifier1`).val(commandValues[0]);
                $(`#command-${command.name}-modifier2`).val(commandValues[1]);
                $(`#command-${command.name}-key`).val(commandValues[2]);
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

function validateDefaultsForBoolPreferences(localStorage, preferences) {
    for (let preference of preferences) {
        if (localStorage[preference.name] === undefined) {
            addOrUpdateStoredValue(preference.name, preference.default);
        }
    }
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
