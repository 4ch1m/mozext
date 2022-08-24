/* =====================================================================================================================
   constants ...
 */

const NEW_LINE = "\n";
const COMMAND_SEPARATOR = "+";
const FORTUNE_COOKIE_SEPARATOR =  NEW_LINE + "%" + NEW_LINE;

const KEYCODE = {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    a: 65,
    b: 66,
    r: 82,
    s: 83,
    t: 84
}

const SIGNATURE_PLACEMENT_CONFIRMATION_CODE = "" +
    KEYCODE.up +
    KEYCODE.up +
    KEYCODE.down +
    KEYCODE.down +
    KEYCODE.left +
    KEYCODE.right +
    KEYCODE.left +
    KEYCODE.right +
    KEYCODE.b +
    KEYCODE.a +
    KEYCODE.s +
    KEYCODE.t +
    KEYCODE.a +
    KEYCODE.r +
    KEYCODE.t; // K0nami Code ;-)

/* =====================================================================================================================
   objects ...
 */

function Signature(
    name = i18n("optionsSignatureNewName"),
    text = "",
    html = "",
    autoSwitch = "",
    autoSwitchMatchAll = false) {
    this.id = uuidv4();
    this.name = name;
    this.text = text;
    this.html = html;
    this.autoSwitch = autoSwitch;
    this.autoSwitchMatchAll = autoSwitchMatchAll;
}

function Image(name = "", tag = "") {
    this.id = uuidv4();
    this.name = name;
    this.tag = tag;
    this.data = /* default placeholder-image: */
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
        "SUVORK5CYII=";
}

function FortuneCookies(name = "", tag = "", cookies = []) {
    this.id = uuidv4();
    this.name = name;
    this.tag = tag;
    this.cookies = cookies;
}

/* =====================================================================================================================
   global vars ...
 */

let signaturePlacementConfirmationCodeInput = "";
let signaturePlacementConfirmationCodeInputCount = 0;

/* =====================================================================================================================
   startup ...
 */

let ready = (callback) => {
    if (document.readyState !== "loading") callback();
    else document.addEventListener("DOMContentLoaded", callback);
}

ready(() => {
    document.body.innerHTML = Mustache.render(BODY, {
        navItems: [
            { status: "active", id: "signaturesTab",      href: "#signaturesTabContent",      i18n: "optionsSignatures"      },
            { status: "",       id: "imagesTab",          href: "#imagesTabContent",          i18n: "optionsImages"          },
            { status: "",       id: "fortuneCookiesTab",  href: "#fortuneCookiesTabContent",  i18n: "optionsFortuneCookies"  },
            { status: "",       id: "identitiesTab",      href: "#identitiesTabContent",      i18n: "optionsIdentities"      },
            { status: "",       id: "miscellaneousTab",   href: "#miscellaneousTabContent",   i18n: "optionsMiscellaneous"   },
            { status: "",       id: "nativeMessagingTab", href: "#nativeMessagingTabContent", i18n: "optionsNativeMessaging" },
            { status: "",       id: "importExportTab",    href: "#importExportTabContent",    i18n: "optionsImportExport"    },
            { status: "",       id: "helpTab",            href: "#helpTabContent",            i18n: "optionsHelp"            }
        ],
        tabPanes: [
            SIGNATURES_TAB_PANE,
            IMAGES_TAB_PANE,
            FORTUNE_COOKIES_TAB_PANE,
            IDENTITIES_TAB_PANE,
            MISCELLANEOUS_TAB_PANE,
            NATIVE_MESSAGING_TAB_PANE,
            IMPORT_EXPORT_TAB_PANE,
            HELP_TAB_PANE
        ]
    });

    browser.storage.local.get().then(async localStorage => {
        // ensure that default values for bool preferences are set (otherwise would be 'undefined')
        await validateDefaultsForBoolPreferences(localStorage, [
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
			{name: "signaturePlacementAboveQuoteOrForwarding", default: false},
            {name: "signatureComposeSeparator", default: true}
        ]);

        // init UI; listen for storage changes
        browser.storage.local.get().then(initUI);
        browser.storage.onChanged.addListener(updateUI);
    });
});

/* =====================================================================================================================
   UI operations ...
 */

async function initUI(localStorage) {
    /* -----------------
        Navigation Tabs
       ----------------- */

    [...document.querySelectorAll("#optionsNav a")].forEach(navItem => {
        let tab = new bootstrap.Tab(navItem);
        navItem.addEventListener("click", e => {
            e.preventDefault();
            tab.show();
        })
    });

    /* -----------
        Signatures
       ------------ */

    let addSignatureRow = signature => {
        let tableRow = document.createElement("tr");
        tableRow.setAttribute("data-signature-id", signature.id);
        tableRow.innerHTML = Mustache.render(SIGNATURE_ROW, {
            id: signature.id,
            name: signature.name
        });
        document.getElementById("signaturesTableBody").appendChild(tableRow);
    };

    let addSignatureModals = signature => {
        let signatureModals = document.getElementById("signatureModals");

        // edit modal
        let editModal = document.createElement("span");
        editModal.innerHTML = Mustache.render(SIGNATURE_EDIT_MODAL, {
            id: signature.id,
            name: signature.name,
            text: signature.text,
            html: signature.html,
            autoSwitch: signature.autoSwitch,
            autoSwitchMatchAll: signature.autoSwitchMatchAll,
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
            autoSwitchMatchAllLabel: i18n("optionsSignatureEditModalAutoSwitchMatchAll"),
            close: i18n("optionsSignatureEditModalClose"),
            save: i18n("optionsSignatureEditModalSave")
        });
        signatureModals.appendChild(editModal);
        initTooltips(document.getElementById("signatureEditModal-" + signature.id));

        // remove modal
        let removeModal = document.createElement("span");
        removeModal.innerHTML = Mustache.render(GENERIC_YES_NO_MODAL, {
            id: "signatureRemoveModal-" + signature.id,
            title: i18n("optionsSignatureRemoveModalTitle"),
            question: i18n("optionsSignatureRemoveModalQuestion"),
            no: i18n("optionsSignatureRemoveModalNo"),
            yes: i18n("optionsSignatureRemoveModalYes"),
            yesButtonId: "signatureRemoveModalYes-" + signature.id
        });
        signatureModals.appendChild(removeModal);
    };

    let addSignatureEventListeners = signatureId => {
        document.getElementById("signatureDefault-" + signatureId).addEventListener("click", () => {
            addOrUpdateStoredValue("defaultSignature", signatureId);
        });
        document.getElementById("signatureUp-" + signatureId).addEventListener("click", () => {
            reorderSignatures(signatureId, "up");
        })
        document.getElementById("signatureDown-" + signatureId).addEventListener("click", () => {
            reorderSignatures(signatureId, "down");
        })
        let updatedSignature = () => {
            return {
                id: signatureId,
                name: document.getElementById("signatureModalName-" + signatureId).value,
                text: document.getElementById("signatureModalText-" + signatureId).value,
                html: document.getElementById("signatureModalHtml-" + signatureId).value,
                autoSwitch: document.getElementById("signatureModalAutoSwitch-" + signatureId).value,
                autoSwitchMatchAll: document.getElementById("signatureModalAutoSwitchMatchAll-" + signatureId).checked
            };
        };
        let editModal = new bootstrap.Modal(document.getElementById("signatureEditModal-" + signatureId))
        document.getElementById("signatureModalSave-" + signatureId).addEventListener("click", () => {
            addOrUpdateItemInStoredArray(updatedSignature(), "signatures");
            editModal.hide();
        });
        let removeModal = new bootstrap.Modal(document.getElementById("signatureRemoveModal-" + signatureId))
        document.getElementById("signatureRemoveModalYes-" + signatureId).addEventListener("click", () => {
            deleteItemFromStoredArrayViaId(signatureId, "signatures", () => {
                document.querySelector(`tr[data-signature-id="${signatureId}"]`).remove();
                removeModal.hide();
            });
        });
    };

    let signatureIds = [];

    if (localStorage.signatures) {
        localStorage.signatures.forEach(signature => {
            signatureIds.push(signature.id);
            addSignatureRow(signature);
            addSignatureModals(signature);
            addSignatureEventListeners(signature.id);
        });
    }

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
        document.getElementById("signatureDefault-" + actualDefaultSignature).checked = true;
    }

    document.getElementById("signatureAdd").addEventListener("click", () => {
        let signature = new Signature();
        addSignatureRow(signature);
        addSignatureModals(signature);
        addSignatureEventListeners(signature.id);
        bootstrap.Modal.getInstance(document.getElementById("signatureEditModal-" + signature.id)).show();
    });

    /* --------
        Images
       -------- */

    let addImageRow = (image, showFileInputLabel = false) => {
        let tableRow = document.createElement("tr");
        tableRow.setAttribute("data-image-id", image.id);
        tableRow.innerHTML = Mustache.render(IMAGES_ROW, {
            id: image.id,
            name: image.name,
            namePlaceholder: i18n("optionsTableColumnImagesNamePlaceholder"),
            tag: image.tag,
            tagPlaceholder: i18n("optionsTableColumnImagesTagPlaceholder"),
            data: (image.data && image.data !== "") ? image.data : undefined,
            fileInputClass: showFileInputLabel ? "" : "color-transparent"
        });

        document.getElementById("imagesTableBody").appendChild(tableRow);
    };

    let addImageModal = image => {
        let removeModal = document.createElement("span");
        removeModal.innerHTML = Mustache.render(GENERIC_YES_NO_MODAL, {
            id: "imageRemoveModal-" + image.id,
            title: i18n("optionsImageRemoveModalTitle"),
            question: i18n("optionsImageRemoveModalQuestion"),
            no: i18n("optionsImageRemoveModalNo"),
            yes: i18n("optionsImageRemoveModalYes"),
            yesButtonId: "imageRemoveModalYes-" + image.id
        });

        document.getElementById("imageModals").appendChild(removeModal);
    };

    let addImageEventListeners = imageId => {
        let imageRemoveModal = new bootstrap.Modal(document.getElementById("imageRemoveModal-" + imageId));
        document.getElementById("imageRemoveModalYes-" + imageId).addEventListener("click", () => {
            deleteItemFromStoredArrayViaId(imageId, "images", () => {
                document.querySelector(`tr[data-image-id="${imageId}"]`).remove();
                imageRemoveModal.hide();
            });
        });
        let updatedImage = () => {
            return {
                id: imageId,
                name: document.getElementById("imageName-" + imageId).value,
                tag: document.getElementById("imageTag-" + imageId).value,
                data: document.getElementById("imageDisplay-" + imageId).getAttribute("src")
            };
        };
        addEventListeners(`#imageName-${imageId}, #imageTag-${imageId}`, "change keyup", () => {
            addOrUpdateItemInStoredArray(updatedImage(), "images");
        });
        document.getElementById("imageFileInput-" + imageId).addEventListener("change", async (e) => {
            document.getElementById("imageDisplay-" + imageId).setAttribute("src", await toBase64(e.target.files[0]));
            addOrUpdateItemInStoredArray(updatedImage(), "images");
        });
    };

    if (localStorage.images) {
        localStorage.images.forEach(image => {
            addImageRow(image);
            addImageModal(image);
            addImageEventListeners(image.id);
        });
    }

    document.getElementById("imageAdd").addEventListener("click", () => {
        let image = new Image();
        addImageRow(image, true);
        addImageModal(image);
        addImageEventListeners(image.id);
    });

    /* -----------------
        Fortune Cookies
       ----------------- */

    let addFortuneCookiesRow = fortuneCookies => {
        let tableRow = document.createElement("tr");
        tableRow.setAttribute("data-fortunecookies-id", fortuneCookies.id);
        tableRow.innerHTML = Mustache.render(FORTUNE_COOKIES_ROW, {
            id: fortuneCookies.id,
            name: fortuneCookies.name,
            namePlaceholder: i18n("optionsTableColumnFortuneCookiesNamePlaceholder"),
            tag: fortuneCookies.tag,
            tagPlaceholder: i18n("optionsTableColumnFortuneCookiesTagPlaceholder"),
            cookies: fortuneCookies.cookies.join(FORTUNE_COOKIE_SEPARATOR)
        });
        document.getElementById("fortuneCookiesTableBody").appendChild(tableRow);
    };

    let addFortuneCookiesModals = fortuneCookies => {
        let fortuneCookiesModals = document.getElementById("fortuneCookiesModals");

        // edit modal
        let editModal = document.createElement("span");
        editModal.innerHTML = Mustache.render(FORTUNE_COOKIES_EDIT_MODAL, {
            id: fortuneCookies.id,
            title: i18n("optionsFortuneCookiesEditModalTitle"),
            cookiesLabel: i18n("optionsFortuneCookiesEditModalLabel"),
            cookiesTooltip: i18n("optionsFortuneCookiesEditModalTooltip"),
            cookiesPlaceholder: i18n("optionsFortuneCookiesEditModalPlaceholder"),
            cookies: fortuneCookies.cookies.join(FORTUNE_COOKIE_SEPARATOR),
            fileImportLabel: i18n("optionsFortuneCookiesEditModalFileImport"),
            close: i18n("optionsFortuneCookiesEditModalClose"),
            save: i18n("optionsFortuneCookiesEditModalSave")
        });
        fortuneCookiesModals.appendChild(editModal);
        initTooltips(document.getElementById("fortuneCookiesEditModal-" + fortuneCookies.id));

        // remove modal
        let removeModal = document.createElement("span");
        removeModal.innerHTML = Mustache.render(GENERIC_YES_NO_MODAL, {
            id: "fortuneCookiesRemoveModal-" + fortuneCookies.id,
            title: i18n("optionsFortuneCookiesRemoveModalTitle"),
            question: i18n("optionsFortuneCookiesRemoveModalQuestion"),
            no: i18n("optionsFortuneCookiesRemoveModalNo"),
            yes: i18n("optionsFortuneCookiesRemoveModalYes"),
            yesButtonId: "fortuneCookiesRemoveModalYes-" + fortuneCookies.id
        });
        fortuneCookiesModals.appendChild(removeModal);
    };

    let addFortuneCookiesEventListeners = fortuneCookiesId => {
        let editModal = new bootstrap.Modal(document.getElementById("fortuneCookiesEditModal-" + fortuneCookiesId));
        addEventListeners("#fortuneCookiesCookies-" + fortuneCookiesId, "click keydown", () => {
            editModal.show();
        });
        document.getElementById("fortuneCookiesEditModalSave-" + fortuneCookiesId).addEventListener("click", () => {
            let textArea = document.getElementById("fortuneCookiesCookies-" + fortuneCookiesId);
            textArea.value = document.getElementById("fortuneCookiesEditModalCookies-" + fortuneCookiesId).value;
            textArea.dispatchEvent(new Event("change"));
            editModal.hide();
        });
        let removeModal = new bootstrap.Modal(document.getElementById("fortuneCookiesRemoveModal-" + fortuneCookiesId));
        document.getElementById("fortuneCookiesRemoveModalYes-" + fortuneCookiesId).addEventListener("click", () => {
            deleteItemFromStoredArrayViaId(fortuneCookiesId, "fortuneCookies", () => {
                document.querySelector(`tr[data-fortunecookies-id="${fortuneCookiesId}"]`).remove();
                removeModal.hide();
            });
        });
        let updatedFortuneCookies = () => {
            return {
                id: fortuneCookiesId,
                name: document.getElementById("fortuneCookiesName-" + fortuneCookiesId).value,
                tag: document.getElementById("fortuneCookiesTag-" + fortuneCookiesId).value,
                cookies: document.getElementById("fortuneCookiesCookies-" + fortuneCookiesId).value.split(FORTUNE_COOKIE_SEPARATOR)
            };
        };
        addEventListeners(
            [ `#fortuneCookiesName-${fortuneCookiesId}`,
              `#fortuneCookiesTag-${fortuneCookiesId}`,
              `#fortuneCookiesCookies-${fortuneCookiesId}` ].join(", "),
            "change keyup",
            () => { addOrUpdateItemInStoredArray(updatedFortuneCookies(), "fortuneCookies"); }
        );
        document.getElementById("fortuneCookiesFileInput-" + fortuneCookiesId).addEventListener("change", async (e) => {
            document.getElementById("fortuneCookiesEditModalCookies-" + fortuneCookiesId).value = await toText(e.target.files[0]);
        });
    };

    if (localStorage.fortuneCookies) {
        localStorage.fortuneCookies.forEach(fortuneCookies => {
            addFortuneCookiesRow(fortuneCookies);
            addFortuneCookiesModals(fortuneCookies);
            addFortuneCookiesEventListeners(fortuneCookies.id);
        });
    }

    document.getElementById("fortuneCookiesAdd").addEventListener("click", () => {
        let fortuneCookies = new FortuneCookies();
        addFortuneCookiesRow(fortuneCookies);
        addFortuneCookiesModals(fortuneCookies);
        addFortuneCookiesEventListeners(fortuneCookies.id);
    });

    /* ------------
        Identities
       ------------ */

    // checkboxes
    let identitiesSwitchSignatureOnChange = document.getElementById("identitiesSwitchSignatureOnChange");
    identitiesSwitchSignatureOnChange.checked = localStorage.identitiesSwitchSignatureOnChange;
    identitiesSwitchSignatureOnChange.addEventListener("click", () => {
        addOrUpdateStoredValue("identitiesSwitchSignatureOnChange", identitiesSwitchSignatureOnChange.checked);
    });
    let identitiesUseAssignedSignatureOnReplyOrForwarding = document.getElementById("identitiesUseAssignedSignatureOnReplyOrForwarding");
    identitiesUseAssignedSignatureOnReplyOrForwarding.checked = localStorage.identitiesUseAssignedSignatureOnReplyOrForwarding;
    identitiesUseAssignedSignatureOnReplyOrForwarding.addEventListener("click", () => {
        addOrUpdateStoredValue("identitiesUseAssignedSignatureOnReplyOrForwarding", identitiesUseAssignedSignatureOnReplyOrForwarding.checked);
    });
    let identitiesOverruleDefaultAction = document.getElementById("identitiesOverruleDefaultAction");
    identitiesOverruleDefaultAction.checked = localStorage.identitiesOverruleDefaultAction;
    identitiesOverruleDefaultAction.addEventListener("click", () => {
        addOrUpdateStoredValue("identitiesOverruleDefaultAction", identitiesOverruleDefaultAction.checked);
    });

    // table rows
    buildIdentitiesTableBody(localStorage);

    // reload-button
    document.getElementById("reloadIdentities").addEventListener("click", () => {
        browser.storage.local.get().then(localStorage => {
            buildIdentitiesTableBody(localStorage);
        });
    });

    // tooltip
    new bootstrap.Tooltip(document.getElementById("identitiesTooltip"), {"title": i18n("optionsIdentitiesTooltip")})

    /* ---------------
        Miscellaneous
       --------------- */

    // default action
    let defaultActionNothing = document.getElementById("defaultActionNothing");
    let defaultActionInsert = document.getElementById("defaultActionInsert");
    let defaultActionOff = document.getElementById("defaultActionOff");
    if (localStorage.defaultAction) {
        switch (localStorage.defaultAction) {
            case "insert":
                defaultActionInsert.checked = true;
                break;
            case "off":
                defaultActionOff.checked = true;
                break;
            default:
                defaultActionNothing.checked = true;
        }
    } else {
        defaultActionNothing.checked = true;
    }
    defaultActionNothing.addEventListener("click", () => {
        addOrUpdateStoredValue("defaultAction", "");
    });
    defaultActionInsert.addEventListener("click", () => {
        addOrUpdateStoredValue("defaultAction", "insert");
    });
    defaultActionOff.addEventListener("click", () => {
        addOrUpdateStoredValue("defaultAction", "off");
    });

    // commands
    let commandsContainer = document.getElementById("commandsContainer");
    let commandNames = [];
    // TODO
    // Temporary workaround until this issue is fixed:
    //    https://developer.thunderbird.net/add-ons/updating/tb78#replacing-options
    //
    // browser.commands.getAll().then(commands => {
    await (await browser.runtime.getBackgroundPage()).browser.commands.getAll().then(commands => {
        for (let command of commands) {
            commandNames.push(command.name);

            let label = i18n("optionsCommandLabel" + command.name.charAt(0).toUpperCase() + command.name.slice(1));
            let commandValues = command.shortcut.split(COMMAND_SEPARATOR);

            let commandValueCheckAndShift = (commandValuesArray, commandValue) => {
                if (typeof commandValuesArray !== "undefined" && commandValuesArray.length > 0 && commandValuesArray[0] === commandValue) {
                    commandValuesArray.shift();
                    return true;
                } else {
                    return false;
                }
            };

            let modifierOptions1 = [];
            for (let modifier of ["Ctrl", "Alt", "Command", "MacCtrl"]) {
                modifierOptions1.push({
                    value: modifier,
                    status: commandValueCheckAndShift(commandValues, modifier) ? "selected" : "",
                    text: modifier
                });
            }

            let modifierOptions2 = [{value: "", status: "", text: ""}]; // second modifier can be empty
            for (let modifier of ["Shift", "Ctrl", "Alt", "Command", "MacCtrl"]) {
                modifierOptions2.push({
                    value: modifier,
                    status: commandValueCheckAndShift(commandValues, modifier) ? "selected" : "",
                    text: modifier
                });
            }

            let keyOptions = [];
            // A-Z
            for (let i = "A".charCodeAt(0); i <= "Z".charCodeAt(0); i++) {
                keyOptions.push({
                    value: String.fromCharCode(i),
                    status: commandValueCheckAndShift(commandValues, String.fromCharCode(i)) ? "selected" : "",
                    text: String.fromCharCode(i)
                });
            }
            // 0-9
            for (let i = 0; i <= 9; i++) {
                keyOptions.push({
                    value: i,
                    status: commandValueCheckAndShift(commandValues, i) ? "selected" : "",
                    text: i
                });
            }
            // F1-F12
            for (let i = 1; i <= 12; i++) {
                let fKey = "F" + i;
                keyOptions.push({
                    value: fKey,
                    status: commandValueCheckAndShift(commandValues, fKey) ? "selected" : "",
                    text: fKey
                });
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
                keyOptions.push({
                    value: key,
                    status: commandValueCheckAndShift(commandValues, key) ? "selected" : "",
                    text: key
                });
            }

            commandsContainer.innerHTML += Mustache.render(MISCELLANEOUS_COMMAND_ROW, {
                id: command.name,
                label: label,
                modifierOptions1: modifierOptions1,
                modifierOptions2: modifierOptions2,
                keyOptions: keyOptions,
                resetButtonText: i18n("optionsCommandReset")
            });
        }
    });
    commandNames.forEach(commandName => {
        let modifier1Element = document.getElementById(`command-${commandName}-modifier1`);
        let modifier2Element = document.getElementById(`command-${commandName}-modifier2`);
        let keyElement = document.getElementById(`command-${commandName}-key`);
        let resetButton = document.getElementById(`command-${commandName}-reset`);
        let successIcon = document.getElementById(`command-${commandName}-success`);
        let failIcon = document.getElementById(`command-${commandName}-fail`);

        let selectorsChanged = () => {
            let elements = [];
            if (modifier1Element.value !== "") {
                elements.push(modifier1Element.value);
            }
            if (modifier2Element.value !== "") {
                elements.push(modifier2Element.value);
            }
            if (keyElement.value !== "") {
                elements.push(keyElement.value);
            }

            updateCommand(commandName, elements.join(COMMAND_SEPARATOR)).then(() => {
                successIcon.classList.remove("d-none");
                failIcon.classList.add("d-none");
            }, () => {
                failIcon.classList.remove("d-none");
                successIcon.classList.add("d-none");
            });
        };

        modifier1Element.addEventListener("change", selectorsChanged);
        modifier2Element.addEventListener("change", selectorsChanged);
        keyElement.addEventListener("change", selectorsChanged);

        resetButton.addEventListener("click", () => {
            resetCommand(commandName);
            successIcon.classList.add("d-none");
            failIcon.classList.add("d-none");
        });
    });

    // replies
    let repliesDisableAutoSwitch = document.getElementById("repliesDisableAutoSwitch");
    repliesDisableAutoSwitch.checked = localStorage.repliesDisableAutoSwitch;
    repliesDisableAutoSwitch.addEventListener("click", () => {
        addOrUpdateStoredValue("repliesDisableAutoSwitch", repliesDisableAutoSwitch.checked);
    });
    let repliesNoDefaultAction = document.getElementById("repliesNoDefaultAction");
    repliesNoDefaultAction.checked = localStorage.repliesNoDefaultAction;
    repliesNoDefaultAction.addEventListener("click", () => {
        addOrUpdateStoredValue("repliesNoDefaultAction", repliesNoDefaultAction.checked);
    });

    // forwardings
    let forwardingsDisableAutoSwitch = document.getElementById("forwardingsDisableAutoSwitch");
    forwardingsDisableAutoSwitch.checked =  localStorage.forwardingsDisableAutoSwitch;
    forwardingsDisableAutoSwitch.addEventListener("click", () => {
        addOrUpdateStoredValue("forwardingsDisableAutoSwitch", forwardingsDisableAutoSwitch.checked);
    });
    let forwardingsNoDefaultAction = document.getElementById("forwardingsNoDefaultAction");
    forwardingsNoDefaultAction.checked = localStorage.forwardingsNoDefaultAction;
    forwardingsNoDefaultAction.addEventListener("click", () => {
        addOrUpdateStoredValue("forwardingsNoDefaultAction", forwardingsNoDefaultAction.checked);
    });

    // auto switch
    let autoSwitchIncludeCc = document.getElementById("autoSwitchIncludeCc");
    autoSwitchIncludeCc.checked = localStorage.autoSwitchIncludeCc;
    autoSwitchIncludeCc.addEventListener("click", () => {
        addOrUpdateStoredValue("autoSwitchIncludeCc", autoSwitchIncludeCc.checked);
    });
    let autoSwitchIncludeBcc = document.getElementById("autoSwitchIncludeBcc");
    autoSwitchIncludeBcc.checked = localStorage.autoSwitchIncludeBcc;
    autoSwitchIncludeBcc.addEventListener("click", () => {
        addOrUpdateStoredValue("autoSwitchIncludeBcc", autoSwitchIncludeBcc.checked);
    });

    // signature separator
    let signatureSeparatorHtml = document.getElementById("signatureSeparatorHtml");
    signatureSeparatorHtml.checked = localStorage.signatureSeparatorHtml;
    signatureSeparatorHtml.addEventListener("click", () => {
        addOrUpdateStoredValue("signatureSeparatorHtml", signatureSeparatorHtml.checked);
    });
    let signatureComposeSeparator = document.getElementById("signatureComposeSeparator");
    signatureComposeSeparator.checked = localStorage.signatureComposeSeparator;
    signatureComposeSeparator.addEventListener("click", () => {
        addOrUpdateStoredValue("signatureComposeSeparator", signatureComposeSeparator.checked);
    });

    // signature placement
    let renderSignaturePlacementConfirmationModal = (id, showYes = true, showNo = true, showConfirmationCode = false) => {
        return Mustache.render(MISCELLANEOUS_SIGNATURE_PLACEMENT_CONFIRMATION_MODAL, {
            id: id,
            title: i18n("signaturePlacementConfirmationModalTitle-" + id),
            question: i18n("signaturePlacementConfirmationModalQuestion-" + id),
            confirmationCode: showConfirmationCode ? MISCELLANEOUS_SIGNATURE_PLACEMENT_CONFIRMATION_CODE_DIV : "",
            yes: showYes ? i18n("signaturePlacementConfirmationModalYes-" + id) : "",
            yesStyle: showYes ? "" : "display: none",
            no: showNo ? i18n("signaturePlacementConfirmationModalNo-" + id) : "",
            noStyle: showNo ? "" : "display: none"
        });
    };
    let clearSignaturePlacementConfirmationCodeInput = () => {
        signaturePlacementConfirmationCodeInput = "";
        signaturePlacementConfirmationCodeInputCount = 0;
        document.querySelectorAll('[id^="signaturePlacementConfirmationCode-"]').forEach(element => {
            element.className = "";
        });
    };
    let signaturePlacementConfirmationModals = document.getElementById("signaturePlacementModals");
    signaturePlacementConfirmationModals.innerHTML += renderSignaturePlacementConfirmationModal(1);
    signaturePlacementConfirmationModals.innerHTML += renderSignaturePlacementConfirmationModal(2);
    signaturePlacementConfirmationModals.innerHTML += renderSignaturePlacementConfirmationModal(3, false, true, true);
    let signaturePlacementConfirmationModal1Element = document.getElementById("signaturePlacementConfirmationModal-1");
    let signaturePlacementConfirmationModal2Element = document.getElementById("signaturePlacementConfirmationModal-2");
    let signaturePlacementConfirmationModal3Element = document.getElementById("signaturePlacementConfirmationModal-3");
    let signaturePlacementConfirmationModal1 = new bootstrap.Modal(signaturePlacementConfirmationModal1Element);
    let signaturePlacementConfirmationModal2 = new bootstrap.Modal(signaturePlacementConfirmationModal2Element);
    let signaturePlacementConfirmationModal3 = new bootstrap.Modal(signaturePlacementConfirmationModal3Element);
    let signaturePlacementConfirmationModal3EventListener = event => {
        signaturePlacementConfirmationCodeInput += event.which;

        if (!SIGNATURE_PLACEMENT_CONFIRMATION_CODE.startsWith(signaturePlacementConfirmationCodeInput)) {
            clearSignaturePlacementConfirmationCodeInput();
        } else {
            document.getElementById("signaturePlacementConfirmationCode-" + signaturePlacementConfirmationCodeInputCount++).classList.add("bg-success");
        }

        if (signaturePlacementConfirmationCodeInput === SIGNATURE_PLACEMENT_CONFIRMATION_CODE) {
            signaturePlacementConfirmationModal3Element.removeEventListener("keydown", signaturePlacementConfirmationModal3EventListener);
            signaturePlacementConfirmationModal3.hide();
            signaturePlacementAboveQuoteOrForwarding.checked = true;
            addOrUpdateStoredValue("signaturePlacementAboveQuoteOrForwarding", true);
        }
    };
    let signaturePlacementAboveQuoteOrForwarding = document.getElementById("signaturePlacementAboveQuoteOrForwarding");
    signaturePlacementAboveQuoteOrForwarding.checked = localStorage.signaturePlacementAboveQuoteOrForwarding;
    signaturePlacementAboveQuoteOrForwarding.addEventListener("click", () => {
        if (signaturePlacementAboveQuoteOrForwarding.checked) {
            signaturePlacementAboveQuoteOrForwarding.checked = false;
            signaturePlacementConfirmationModal1.show();
        } else {
            addOrUpdateStoredValue("signaturePlacementAboveQuoteOrForwarding", false);
        }
    });
    document.getElementById("signaturePlacementConfirmation-1").addEventListener("click", () => {
        signaturePlacementConfirmationModal1.hide();
        signaturePlacementConfirmationModal2.show();
    });
    document.getElementById("signaturePlacementConfirmation-2").addEventListener("click", () => {
        signaturePlacementConfirmationModal2.hide();
        signaturePlacementConfirmationModal3Element.addEventListener("keydown", signaturePlacementConfirmationModal3EventListener);
        clearSignaturePlacementConfirmationCodeInput();
        signaturePlacementConfirmationModal3.show();
    });

    /* ------------------
        Native Messaging
       ------------------ */

    // Github link
    let nativeMessagingGithubLink = document.getElementById("nativeMessagingGithubLink");
    nativeMessagingGithubLink.innerText = nativeMessagingGithubLink.href;

    // message input
    let nativeMessagingMessage = document.getElementById("nativeMessagingMessage");
    nativeMessagingMessage.value = JSON.stringify({
        tag: "test",
        isPlainText: true,
        type: "reply"
    }, null, 2);
    addEventListeners(nativeMessagingMessage, "change keyup", () => {
        validateNativeMessagingMessage();
    });

    // send button
    document.getElementById("nativeMessagingSendButton").addEventListener("click", () => {
        testNativeMessaging();
    });

    // tooltips
    new bootstrap.Tooltip(document.getElementById("nativeMessagingMessageTooltip"), {"title": i18n("nativeMessagingMessageTooltip")});
    new bootstrap.Tooltip(document.getElementById("nativeMessagingResponseTooltip"), {"title": i18n("nativeMessagingResponseTooltip")});

    /* -----------------
        Import / Export
       ----------------- */

    let importExportData = document.getElementById("importExportData");

    // input-/change-listeners
    addEventListeners(importExportData, "change keyup", () => {
        validateImportExportData();
    });

    let importExportModals = document.getElementById("importExportModals");

    // success modal
    let importExportSuccessModalElement = document.createElement("span");
    let importExportSuccessModalId = "importSuccessModal";
    importExportSuccessModalElement.innerHTML = Mustache.render(GENERIC_SUCCESS_MODAL, {
        id: importExportSuccessModalId,
        title: i18n("optionsImportExportSuccessModalTitle"),
        text: i18n("optionsImportExportSuccessModalInfo"),
        ok: i18n("optionsImportExportSuccessModalOk")
    });
    importExportModals.appendChild(importExportSuccessModalElement);
    let importExportSuccessModal = new bootstrap.Modal(document.getElementById(importExportSuccessModalId));

    // confirmation-modal
    let importExportConfirmationModalElement = document.createElement("span");
    let importExportConfirmationModalId = "importExportConfirmationModal";
    let importExportConfirmationModalYesButtonId = "importExportConfirmationModalYes";
    importExportConfirmationModalElement.innerHTML = Mustache.render(GENERIC_YES_NO_MODAL, {
        id: importExportConfirmationModalId,
        title: i18n("optionsImportExportConfirmationModalTitle"),
        question: i18n("optionsImportExportConfirmationModalQuestion"),
        no: i18n("optionsImportExportConfirmationModalNo"),
        yes: i18n("optionsImportExportConfirmationModalYes"),
        yesButtonId: importExportConfirmationModalYesButtonId
    });
    importExportModals.appendChild(importExportConfirmationModalElement);
    let importExportConfirmationModal = new bootstrap.Modal(document.getElementById(importExportConfirmationModalId));
    document.getElementById(importExportConfirmationModalYesButtonId).addEventListener("click", () => {
        try {
            addOrUpdateStoredValue("signatures", JSON.parse(importExportData.value));
            importExportSuccessModal.show();
        } catch(e) {
            console.log("unable to store signatures. probably invalid json-string.");
        }
        importExportConfirmationModal.hide();
    });

    // export
    document.getElementById("exportSignatures").addEventListener("click", () => {
        browser.storage.local.get().then(localStorage => {
            if (localStorage.signatures) {
                importExportData.value = JSON.stringify(localStorage.signatures, null, 2);
                validateImportExportData();
            }
        });
    });

    // clipboard
    document.getElementById("copySignaturesToClipboard").addEventListener("click", () => {
        copyTextToClipboard(importExportData.value);
    });

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
                            document.getElementById("signatureName-" + signature.id).textContent = signature.name;
                        });

                        buildIdentitiesTableBody(localStorage);
                    });
                }
                break;
        }
    }
}

function initTooltips(element = document) {
    let tooltipTriggerList = [].slice.call(element.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerElement => {
        return new bootstrap.Tooltip(tooltipTriggerElement);
    });
}

function reorderSignatures(id, direction) {
    let signatureRowAttribute = "data-signature-id";

    let allSignatureRows = document.querySelectorAll(`tr[${signatureRowAttribute}]`);
    let chosenSignatureRow = document.querySelector(`tr[${signatureRowAttribute}="${id}"]`);

    if (direction === "up") {
        if (allSignatureRows[0].getAttribute(signatureRowAttribute) === chosenSignatureRow.getAttribute(signatureRowAttribute)) {
            return;
        }

        chosenSignatureRow.previousElementSibling.before(chosenSignatureRow);
    } else {
        if (allSignatureRows[allSignatureRows.length - 1].getAttribute(signatureRowAttribute) === chosenSignatureRow.getAttribute(signatureRowAttribute)) {
            return;
        }
        chosenSignatureRow.nextElementSibling.after(chosenSignatureRow);
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
            localStorage.signatures = arrayMove(
                localStorage.signatures,
                signatureIndex,
                (direction === "up" ? signatureIndex - 1 : signatureIndex + 1)
            );
            browser.storage.local.set(localStorage);
        }
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
        let tableBody = document.getElementById("identitiesTableBody");
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild)
        }

        // get all mail accounts
        browser.accounts.list().then(mailAccounts => {
            // iterate over all mail accounts
            for (let mailAccount of mailAccounts) {
                for (let mailIdentity of mailAccount.identities) {
                    let assignedSignature = getAssignedSignatureIdForMailIdentityId(mailIdentity.id);

                    // get available signatures; build array for selection in ui
                    let availableSignatures = [];
                    if (localStorage.signatures) {
                        localStorage.signatures.forEach(signature => {
                            availableSignatures.push({value: signature.id, status: assignedSignature === signature.id ? "selected" : "", text: signature.name});
                        });
                    }

                    // append a new "identity row" to the table
                    let identityRow = document.createElement("tr");
                    identityRow.innerHTML = Mustache.render(IDENTITIES_ROW, {
                        mailIdentity: mailIdentity,
                        signatures: availableSignatures
                    });
                    tableBody.appendChild(identityRow);

                    // change-listener for the select element
                    let identitySignature = document.getElementById(`identity-${mailIdentity.id}-signature`);
                    identitySignature.addEventListener("change", () => {
                        addOrUpdateItemInStoredArray({id: mailIdentity.id, signatureId: identitySignature.value} , "identities");
                    });
                }
            }
        });
    });
}

function validateImportExportData() {
    let importExportData = document.getElementById("importExportData").value;
    let importExportDataValidation = document.getElementById("importExportDataValidation");
    let importSignaturesButton = document.getElementById("importSignatures");

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

    importExportDataValidation.innerText = success ? i18n("optionsImportExportValidationSuccess") : i18n("optionsImportExportValidationFailure");
    importExportDataValidation.classList.remove(success ? "text-danger" : "text-success");
    importExportDataValidation.classList.add(success ? "text-success" : "text-danger");
    importSignaturesButton.disabled = !success;
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
        commands.forEach(command => {
            if (command.name === name) {
                // TODO refactor - this will only work if the default command consists of three values
                let commandValues = command.shortcut.split(COMMAND_SEPARATOR);
                document.getElementById(`command-${name}-modifier1`).value = commandValues[0];
                document.getElementById(`command-${name}-modifier2`).value = commandValues[1];
                document.getElementById(`command-${name}-key`).value = commandValues[2];
            }
        });
    });
}

function validateNativeMessagingMessage() {
    let message = document.getElementById("nativeMessagingMessage").value

    let validationInfo = document.getElementById("nativeMessagingMessageValidation");
    let sendButton = document.getElementById("nativeMessagingSendButton");

    let success = true;

    try {
        JSON.parse(message);
    } catch(e) {
        success = false;
    }

    validationInfo.innerText = success ? i18n("nativeMessagingMessageValidationSuccess") : i18n("nativeMessagingMessageValidationFailure");
    validationInfo.classList.remove(success ? "text-danger" : "text-success");
    validationInfo.classList.add(success ? "text-success" : "text-danger");
    sendButton.disabled = !success;
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

async function validateDefaultsForBoolPreferences(localStorage, preferences) {
    for (let preference of preferences) {
        if (localStorage[preference.name] === undefined) {
            localStorage = {...localStorage, [preference.name]: preference.default};
        }
    }

    await browser.storage.local.set(localStorage);
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

function testNativeMessaging() {
    let validationInfo = document.getElementById("nativeMessagingResponseValidation");
    validationInfo.innerText = "";
    validationInfo.className = "";

    browser.runtime.sendMessage({
        type: "sendNativeMessage",
        value: JSON.parse(document.getElementById("nativeMessagingMessage").value)
    }).then(result => {
        let resultObject = JSON.parse(result);

        document.getElementById("nativeMessagingResponse").value = JSON.stringify(resultObject.response, null, 2);

        if (resultObject.success) {
            let messagePropertyIsPresent = resultObject.response.hasOwnProperty("message"); // for now we only check if the "message" property is provided in the response
            validationInfo.classList.add(messagePropertyIsPresent ? "text-success" : "text-danger");
            validationInfo.innerText =  i18n(messagePropertyIsPresent ? "nativeMessagingResponseValidationSuccess" : "nativeMessagingResponseValidationInvalid");
        } else {
            validationInfo.classList.add("text-danger");
            validationInfo.innerText = i18n("nativeMessagingResponseValidationFailure");
        }
    });
}
