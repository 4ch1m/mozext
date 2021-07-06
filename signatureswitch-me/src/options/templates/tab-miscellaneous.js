const MISCELLANEOUS_TAB_PANE = `
    <div class="tab-pane m-2" id="miscellaneousTabContent" role="tabpanel">
        <!-- default action -->
        <div class="mt-3">
            <h5><b data-i18n="optionsDefaultAction"></b></h5>
            <hr class="w-100">
            <div>
                <h6 data-i18n="optionsDefaultActionDescription"></h6>
                <div class="ms-3">
                    <div class="formcheck">
                        <input type="radio" class="form-check-input" id="defaultActionNothing" name="defaultAction">
                        <label class="form-check-label" for="defaultActionNothing" data-i18n="optionsDefaultActionNothing"></label>
                    </div>
                    <div class="formcheck">
                        <input type="radio" class="form-check-input" id="defaultActionInsert" name="defaultAction">
                        <label class="form-check-label" for="defaultActionInsert" data-i18n="optionsDefaultActionInsert"></label>
                    </div>
                    <div class="formcheck">
                        <input type="radio" class="form-check-input" id="defaultActionOff" name="defaultAction">
                        <label class="form-check-label" for="defaultActionOff" data-i18n="optionsDefaultActionOff"></label>
                    </div>
                </div>
            </div>
        </div>
        <!-- commands -->
        <div class="mt-3">
            <h5><b data-i18n="optionsCommands"></b></h5>
            <hr class="w-100">
            <div id="commandsContainer" class="container">
                <!-- commands ... -->
            </div>
        </div>
        <!-- replies -->
        <div class="mt-3">
            <h5><b data-i18n="optionsReplies"></b></h5>
            <hr class="w-100">
            <div>
                <div class="ms-3">
                    <div>
                        <input type="checkbox" class="form-check-input" id="repliesDisableAutoSwitch">
                        <label for="repliesDisableAutoSwitch" data-i18n="optionsRepliesDisableAutoSwitch"></label>
                    </div>
                    <div>
                        <input type="checkbox" class="form-check-input" id="repliesNoDefaultAction">
                        <label for="repliesNoDefaultAction" data-i18n="optionsRepliesNoDefaultAction"></label>
                    </div>
                </div>
            </div>
        </div>
        <!-- forwardings -->
        <div class="mt-3">
            <h5><b data-i18n="optionsForwardings"></b></h5>
            <hr class="w-100">
            <div>
                <div class="ms-3">
                    <div>
                        <input type="checkbox" class="form-check-input" id="forwardingsDisableAutoSwitch">
                        <label for="forwardingsDisableAutoSwitch" data-i18n="optionsForwardingsDisableAutoSwitch"></label>
                    </div>
                    <div>
                        <input type="checkbox" class="form-check-input" id="forwardingsNoDefaultAction">
                        <label for="forwardingsNoDefaultAction" data-i18n="optionsForwardingsNoDefaultAction"></label>
                    </div>
                </div>
            </div>
        </div>
        <!-- auto switch -->
        <div class="mt-3">
            <h5><b data-i18n="optionsAutoSwitch"></b></h5>
            <hr class="w-100">
            <div>
                <div class="ms-3">
                    <div>
                        <input type="checkbox" class="form-check-input" id="autoSwitchIncludeCc">
                        <label for="autoSwitchIncludeCc" data-i18n="optionsAutoSwitchIncludeCc"></label>
                    </div>
                    <div>
                        <input type="checkbox" class="form-check-input" id="autoSwitchIncludeBcc">
                        <label for="autoSwitchIncludeBcc" data-i18n="optionsAutoSwitchIncludeBcc"></label>
                    </div>
                </div>
            </div>
        </div>
        <!-- signature separator -->
        <div class="mt-3">
            <h5><b data-i18n="optionsSignatureSeparator"></b></h5>
            <hr class="w-100">
            <div>
                <div class="ms-3">
                    <div>
                        <input type="checkbox" class="form-check-input" id="signatureSeparatorHtml">
                        <label for="signatureSeparatorHtml" data-i18n="optionsSignatureSeparatorHtml"></label>
                    </div>
                </div>
            </div>
        </div>
       <!-- signature placement -->
        <div class="mt-3">
            <h5><b data-i18n="optionsSignaturePlacement"></b></h5>
            <hr class="w-100">
            <div>
                <div class="ms-3">
                    <div>
                        <input type="checkbox" class="form-check-input" id="signaturePlacementAboveQuoteOrForwarding">
                        <label for="signaturePlacementAboveQuoteOrForwarding" data-i18n="optionsSignaturePlacementAboveQuoteOrForwarding"></label>&nbsp;<b class="badge bg-dark text-uppercase" data-i18n="optionsSignaturePlacementAboveQuoteOrForwardingNotRecommended"></b>
                    </div>
                </div>
            </div>
            <span id="signaturePlacementModals">
            </span>
        </div>
    </div>
`;

const MISCELLANEOUS_COMMAND_ROW = `
    <div class="row mb-2">
        <div class="col-sm-2 text-end">
            <label class="nobr" for="command-{{id}}">{{label}}</label>
        </div>
        <div class="col-sm d-flex flex-row nobr">
            <select id="command-{{id}}-modifier1" class="form-select" style="width:auto">
                {{#modifierOptions1}}
                    <option value="{{value}}" {{status}}>{{text}}</option>
                {{/modifierOptions1}}
            </select>      
            &nbsp;+&nbsp;  
            <select id="command-{{id}}-modifier2" class="form-select" style="width:auto">
                {{#modifierOptions2}}
                    <option value="{{value}}" {{status}}>{{text}}</option>
                {{/modifierOptions2}}
            </select>
            &nbsp;+&nbsp;  
            <select id="command-{{id}}-key" class="form-select" style="width:auto">
                {{#keyOptions}}
                    <option value="{{value}}" {{status}}>{{text}}</option>
                {{/keyOptions}}
            </select>
            <button type="button" id="command-{{id}}-reset" class="btn btn-primary btn-sm ms-2">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="/_images/bootstrap-icons.svg#arrow-counterclockwise"/>
                </svg>
                &nbsp;
                <span>{{resetButtonText}}</span>
            </button>
            &nbsp;
            <svg id="command-{{id}}-success" class="bi d-none text-success" width="2em" height="2em" fill="currentColor">
                <use xlink:href="/_images/bootstrap-icons.svg#check"/>
            </svg>
            <svg id="command-{{id}}-fail" class="bi d-none text-danger" width="2em" height="2em" fill="currentColor">
                <use xlink:href="/_images/bootstrap-icons.svg#x"/>
            </svg>
        </div>
    </div>
`;

const MISCELLANEOUS_SIGNATURE_PLACEMENT_CONFIRMATION_MODAL = `
    <div class="modal fade" id="signaturePlacementConfirmationModal-{{id}}" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{title}}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">{{question}}</div>
                {{{confirmationCode}}}
                <div class="modal-footer">
                    <button id="signaturePlacementConfirmation-{{id}}" type="button" class="btn btn-sm btn-light" style="{{yesStyle}}">
                        <svg class="bi" width="2em" height="2em" fill="currentColor">
                            <use xlink:href="/_images/bootstrap-icons.svg#check"/>
                        </svg>
                        &nbsp;
                        <span>{{yes}}</span>
                    </button>
                    <button type="button" class="btn btn-success" data-bs-dismiss="modal" style="{{noStyle}}">
                        <svg class="bi" width="2em" height="2em" fill="currentColor">
                            <use xlink:href="/_images/bootstrap-icons.svg#x"/>
                        </svg>
                        &nbsp;
                        <span>{{no}}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
`;

const MISCELLANEOUS_SIGNATURE_PLACEMENT_CONFIRMATION_CODE_DIV = `
    <div class="d-flex align-items-center justify-content-center text-large mb-3">
        <kbd id="signaturePlacementConfirmationCode-0">&uparrow;</kbd>
        &nbsp;
        <kbd id="signaturePlacementConfirmationCode-1">&uparrow;</kbd>
        &nbsp;
        <kbd id="signaturePlacementConfirmationCode-2">&downarrow;</kbd>
        &nbsp;
        <kbd id="signaturePlacementConfirmationCode-3">&downarrow;</kbd>
        &nbsp;
        <kbd id="signaturePlacementConfirmationCode-4">&leftarrow;</kbd>
        &nbsp;
        <kbd id="signaturePlacementConfirmationCode-5">&rightarrow;</kbd>
        &nbsp;
        <kbd id="signaturePlacementConfirmationCode-6">&leftarrow;</kbd>
        &nbsp;
        <kbd id="signaturePlacementConfirmationCode-7">&rightarrow;</kbd>
        &nbsp;
        <kbd id="signaturePlacementConfirmationCode-8">B</kbd>
        &nbsp;
        <kbd id="signaturePlacementConfirmationCode-9">A</kbd>
        &nbsp;
        &mdash;
        &nbsp;
        <kbd id="signaturePlacementConfirmationCode-10">S</kbd>
        &nbsp;
        <kbd id="signaturePlacementConfirmationCode-11">T</kbd>
        &nbsp;
        <kbd id="signaturePlacementConfirmationCode-12">A</kbd>
        &nbsp;
        <kbd id="signaturePlacementConfirmationCode-13">R</kbd>
        &nbsp;
        <kbd id="signaturePlacementConfirmationCode-14">T</kbd>
    </div>
`;
