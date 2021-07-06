const SIGNATURES_TAB_PANE = `
    <div class="tab-pane m-2 active" id="signaturesTabContent" role="tabpanel">
        <div class="mt-3">
            <div id="signaturesTable">
                <table class="table table-bordered text-center">
                    <thead class="table-dark">
                        <tr>
                            <!-- default -->
                            <th class="w-auto text-center" data-i18n="optionsTableColumnSignaturesDefault"></th>
                            <!-- name -->
                            <th class="w-50 text-center" data-i18n="optionsTableColumnSignaturesName"></th>
                            <!-- edit / up / down / remove -->
                            <th class="w-25" colspan="4" data-i18n="optionsTableColumnSignaturesAction"></th>
                        </tr>
                    </thead>
                    <tbody id="signaturesTableBody">
                        <!-- signatures ... -->
                    </tbody>
                </table>
                <!-- add -->
                <span id="signatureAdd">
                    <button type="button" class="btn btn-primary btn-sm">
                        <svg class="bi" width="2em" height="2em" fill="currentColor">
                            <use xlink:href="/_images/bootstrap-icons.svg#plus"/>
                        </svg>
                        &nbsp;
                        <span data-i18n="optionsAddSignature"></span>
                    </button>
                </span>
            </div>
            <!-- modals -->
            <span id="signatureModals">
            </span>
        </div>
    </div>
`;

const SIGNATURE_ROW = `
    <!-- default -->
    <td>
        <input id="signatureDefault-{{id}}" class="form-check-input" type="radio" name="defaultSignature">
    </td>
    <!-- name -->
    <td>
        <b id="signatureName-{{id}}">{{name}}</b>
    </td>
    <!-- edit -->
    <td>
        <span class="signaturesTable-edit">
            <button type="button" class="btn btn-light btn-sm" data-bs-toggle="modal" data-bs-target="#signatureEditModal-{{id}}">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="/_images/bootstrap-icons.svg#pencil"/>
                </svg>
            </button>
        </span>
    </td>
    <!-- up -->
    <td>
        <button id="signatureUp-{{id}}" type="button" class="btn btn-light btn-sm">
            <svg class="bi" width="2em" height="2em" fill="currentColor">
                <use xlink:href="/_images/bootstrap-icons.svg#arrow-up"/>
            </svg>
        </button>
    </td>
    <!-- down -->
    <td>
        <button id="signatureDown-{{id}}" type="button" class="btn btn-light btn-sm">
            <svg class="bi" width="2em" height="2em" fill="currentColor">
                <use xlink:href="/_images/bootstrap-icons.svg#arrow-down"/>
            </svg>
        </button>
    </td>
    <!-- remove -->
    <td>
        <button type="button" class="btn btn-light btn-sm" data-bs-toggle="modal" data-bs-target="#signatureRemoveModal-{{id}}">
            <svg class="bi" width="2em" height="2em" fill="currentColor">
                <use xlink:href="/_images/bootstrap-icons.svg#trash"/>
            </svg>
        </button>
    </td>
`;

const SIGNATURE_EDIT_MODAL = `
    <div class="modal fade" id="signatureEditModal-{{id}}" data-bs-backdrop="static" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{title}}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div>
                        <label for="signatureModalName-{{id}}">
                            {{nameLabel}}
                            <span data-bs-toggle="tooltip" title="{{nameTooltip}}">
                                <svg class="bi" width="1em" height="1em" fill="currentColor">
                                    <use xlink:href="/_images/bootstrap-icons.svg#info-circle"/>
                                </svg>
                            </span>
                        </label>
                        <!-- name -->
                        <input type="text" class="form-control" id="signatureModalName-{{id}}" placeholder="{{namePlaceholder}}" value="{{name}}">
                    </div>
                    <div class="mt-3">
                        <label for="signatureEditAccordion-{{id}}">
                            {{contentLabel}}
                            <span data-bs-toggle="tooltip" title="{{contentTooltip}}">
                                <svg class="bi" width="1em" height="1em" fill="currentColor">
                                    <use xlink:href="/_images/bootstrap-icons.svg#info-circle"/>
                                </svg>
                            </span>
                        </label>
                        <div class="accordion" id="signatureEditAccordion-{{id}}">
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="signatureEditAccordionPlaintextHeader-{{id}}">
                                    <button class="accordion-button" type="button" data-mdb-toggle="collapse" data-mdb-target="#signatureEditAccordionPlaintext-{{id}}" aria-expanded="true">
                                        <svg class="bi mr-3" width="2em" height="2em" fill="currentColor">
                                            <use xlink:href="/_images/bootstrap-icons.svg#type"/>
                                        </svg>
                                        &nbsp;&nbsp;&nbsp;
                                        {{textHeading}}&nbsp;&hellip;
                                    </button>
                                </h2>
                                <div id="signatureEditAccordionPlaintext-{{id}}" class="accordion-collapse collapse show" data-mdb-parent="#signatureEditAccordion-{{id}}">
                                    <div class="accordion-body">
                                        <textarea class="form-control" id="signatureModalText-{{id}}" rows="5" spellcheck="false" placeholder="{{textPlaceholder}}">{{text}}</textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="signatureEditAccordionHtmlHeader-{{id}}">
                                    <button class="accordion-button collapsed" type="button" data-mdb-toggle="collapse" data-mdb-target="#signatureEditAccordionHtml-{{id}}" aria-expanded="false">
                                        <svg class="bi mr-3" width="2em" height="2em" fill="currentColor">
                                            <use xlink:href="/_images/bootstrap-icons.svg#code-slash"/>
                                        </svg>
                                        &nbsp;&nbsp;&nbsp;
                                        {{htmlHeading}}&nbsp;&hellip;
                                    </button>
                                </h2>
                                <div id="signatureEditAccordionHtml-{{id}}" class="accordion-collapse collapse" data-mdb-parent="#signatureEditAccordion-{{id}}">
                                    <div class="accordion-body">
                                        <textarea class="form-control" id="signatureModalHtml-{{id}}" rows="5" spellcheck="false" placeholder="{{htmlPlaceholder}}">{{html}}</textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3">
                        <label for="signatureModalAutoSwitch-{{id}}">
                            {{autoSwitchLabel}}
                            <span data-bs-toggle="tooltip" title="{{autoSwitchTooltip}}">
                                <svg class="bi" width="1em" height="1em" fill="currentColor">
                                    <use xlink:href="/_images/bootstrap-icons.svg#info-circle"/>
                                </svg>
                            </span>
                        </label>
                        <!-- auto-switch -->
                        <input type="text" class="form-control" id="signatureModalAutoSwitch-{{id}}" placeholder="{{autoSwitchPlaceholder}}" value="{{autoSwitch}}">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal">
                        <svg class="bi" width="2em" height="2em" fill="currentColor">
                            <use xlink:href="/_images/bootstrap-icons.svg#x"/>
                        </svg>
                        &nbsp;
                        {{close}}
                    </button>
                    <button id="signatureModalSave-{{id}}" type="button" class="btn btn-success">
                        <svg class="bi" width="2em" height="2em" fill="currentColor">
                            <use xlink:href="/_images/bootstrap-icons.svg#check"/>
                        </svg>
                        &nbsp;
                        {{save}}
                    </button>
                </div>
            </div>
        </div>
    </div>
`;
