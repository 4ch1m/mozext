const COMMAND_SEPARATOR = "+";
const NEW_LINE = "\n";
const FORTUNE_COOKIE_SEPARATOR =  NEW_LINE + "%" + NEW_LINE;

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_A = 65;
const KEY_B = 66;
const KEY_R = 82;
const KEY_S = 83;
const KEY_T = 84;

const SIGNATURE_PLACEMENT_CONFIRMATION_CODE = `${KEY_UP}${KEY_UP}${KEY_DOWN}${KEY_DOWN}${KEY_LEFT}${KEY_RIGHT}${KEY_LEFT}${KEY_RIGHT}${KEY_B}${KEY_A}${KEY_S}${KEY_T}${KEY_A}${KEY_R}${KEY_T}`;
let signaturePlacementConfirmationCodeInput = "";
let signaturePlacementConfirmationCodeInputCount = 0;

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
            {name: "autoSwitchIncludeCc", default: false},
            {name: "autoSwitchIncludeBcc", default: false},
            {name: "signatureSeparatorHtml", default: false},
			{name: "signaturePlacementAboveQuoteOrForwarding", default: false}
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
                defaultActionInsert.prop("checked", true);
                break;
            case "off":
                defaultActionOff.prop("checked", true);
                break;
            default:
                defaultActionNothing.prop("checked", true);
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

    // auto switch
    let autoSwitchIncludeCc = $("#autoSwitchIncludeCc");
    autoSwitchIncludeCc.prop("checked", localStorage.autoSwitchIncludeCc);
    autoSwitchIncludeCc.click(() => {
        addOrUpdateStoredValue("autoSwitchIncludeCc", autoSwitchIncludeCc.prop("checked"));
    });
    let autoSwitchIncludeBcc = $("#autoSwitchIncludeBcc");
    autoSwitchIncludeBcc.prop("checked", localStorage.autoSwitchIncludeBcc);
    autoSwitchIncludeBcc.click(() => {
        addOrUpdateStoredValue("autoSwitchIncludeBcc", autoSwitchIncludeBcc.prop("checked"));
    });

    // signature separator
    let signatureSeparatorHtml = $("#signatureSeparatorHtml");
    signatureSeparatorHtml.prop("checked", localStorage.signatureSeparatorHtml);
    signatureSeparatorHtml.click(() => {
        addOrUpdateStoredValue("signatureSeparatorHtml", signatureSeparatorHtml.prop("checked"));
    });

    // signature placement
    let signaturePlacementConfirmationModals = $("#signaturePlacementModals");
    signaturePlacementConfirmationModals.append(renderSignaturePlacementConfirmationModal(1));
    signaturePlacementConfirmationModals.append(renderSignaturePlacementConfirmationModal(2));
    signaturePlacementConfirmationModals.append(renderSignaturePlacementConfirmationModal(3, false, true, true));
    let signaturePlacementConfirmationModal1 = $("#signaturePlacementConfirmationModal-1");
    let signaturePlacementConfirmationModal2 = $("#signaturePlacementConfirmationModal-2");
    let signaturePlacementConfirmationModal3 = $("#signaturePlacementConfirmationModal-3");
    let signaturePlacementAboveQuoteOrForwarding = $("#signaturePlacementAboveQuoteOrForwarding");
    signaturePlacementAboveQuoteOrForwarding.prop("checked", localStorage.signaturePlacementAboveQuoteOrForwarding);
    signaturePlacementAboveQuoteOrForwarding.click(() => {
        if (signaturePlacementAboveQuoteOrForwarding.prop("checked")) {
            signaturePlacementAboveQuoteOrForwarding.prop("checked", false);
            signaturePlacementConfirmationModal1.modal("show");
        } else {
            addOrUpdateStoredValue("signaturePlacementAboveQuoteOrForwarding", false);
        }
    });
    $("#signaturePlacementConfirmation-1").click(() => {
        signaturePlacementConfirmationModal1.modal("hide");
        signaturePlacementConfirmationModal2.modal("show");
    });
    $("#signaturePlacementConfirmation-2").click(() => {
        signaturePlacementConfirmationModal2.modal("hide");
        signaturePlacementConfirmationModal3.on("keydown", event => {
            signaturePlacementConfirmationCodeInput += event.which;

            if (!SIGNATURE_PLACEMENT_CONFIRMATION_CODE.startsWith(signaturePlacementConfirmationCodeInput)) {
                clearSignaturePlacementConfirmationCodeInput();
            } else {
                $("#signaturePlacementConfirmationCode-" + signaturePlacementConfirmationCodeInputCount++).addClass("bg-success");
            }

            if (signaturePlacementConfirmationCodeInput === SIGNATURE_PLACEMENT_CONFIRMATION_CODE) {
                signaturePlacementConfirmationModal3.off();
                signaturePlacementConfirmationModal3.modal("hide");
                signaturePlacementAboveQuoteOrForwarding.prop("checked", true);
                addOrUpdateStoredValue("signaturePlacementAboveQuoteOrForwarding", true);
            }
        });

        clearSignaturePlacementConfirmationCodeInput();
        signaturePlacementConfirmationModal3.modal("show");
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

    /* ------
        Help
       ------ */

    // FIXME / TODO
    // (hopefully) temporary workaround!
    // directly using img-references in the source-attribute breaks copy/paste functionality in text-fields;
    // yes... sounds weird... but it's true! :-D
    const IMG_MOZILLA_DINO = "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";
    $("#helpImageMozillaDino").attr("src", "data:image/png;base64," + IMG_MOZILLA_DINO);
    const IMG_GITHUB_OCTOCAT = "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";
    $("#helpImageGithubOctocat").attr("src", "data:image/png;base64," + IMG_GITHUB_OCTOCAT);

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

function clearSignaturePlacementConfirmationCodeInput() {
    signaturePlacementConfirmationCodeInput = "";
    signaturePlacementConfirmationCodeInputCount = 0;
    $('[id^="signaturePlacementConfirmationCode-"]').removeClass();
}

function renderSignaturePlacementConfirmationModal(id, showYes = true, showNo = true, showConfirmationCode = false) {
    return Mustache.render(SIGNATURE_PLACEMENT_CONFIRMATION_MODAL, {
        id: id,
        title: i18n("signaturePlacementConfirmationModalTitle-" + id),
        question: i18n("signaturePlacementConfirmationModalQuestion-" + id),
        confirmationCode: showConfirmationCode ? SIGNATURE_PLACEMENT_CONFIRMATION_CODE_DIV : "",
        yes: showYes ? i18n("signaturePlacementConfirmationModalYes-" + id) : "",
        yesStyle: showYes ? "" : "display: none",
        no: showNo ? i18n("signaturePlacementConfirmationModalNo-" + id) : "",
        noStyle: showNo ? "" : "display: none"
    })
}
