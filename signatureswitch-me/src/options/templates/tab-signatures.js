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
                        <label for="signatureModalContent-{{id}}">
                            {{contentLabel}}
                            <span data-bs-toggle="tooltip" title="{{contentTooltip}}">
                                <svg class="bi" width="1em" height="1em" fill="currentColor">
                                    <use xlink:href="/_images/bootstrap-icons.svg#info-circle"/>
                                </svg>
                            </span>
                        </label>
                        <div class="input-group" id="signatureModalContent-{{id}}">
                            <div class="form-floating">
                                <!-- plaintext content -->
                                <textarea
                                    style="height: 200px; font-family:monospace;"
                                    class="form-control form-floating-placeholder-fix"
                                    placeholder="{{textPlaceholder}}"
                                    spellcheck="false"
                                    id="signatureModalText-{{id}}">{{text}}</textarea>
                                <label for="signatureModalText-{{id}}">
                                <svg class="bi mr-3" width="1em" height="1em" fill="currentColor">
                                    <use xlink:href="/_images/bootstrap-icons.svg#type"/>
                                </svg>
                                {{textLabel}}
                                </label>
                            </div>                    
                            <div class="form-floating">
                                <!-- HTML content -->
                                <textarea
                                    style="height: 200px;"
                                    class="form-control form-floating-placeholder-fix"
                                    placeholder="{{htmlPlaceholder}}"
                                    spellcheck="false"
                                    id="signatureModalHtml-{{id}}">{{html}}</textarea>
                                <label for="signatureModalHtml-{{id}}">
                                <svg class="bi mr-3" width="1em" height="1em" fill="currentColor">
                                    <use xlink:href="/_images/bootstrap-icons.svg#code-slash"/>
                                </svg>
                                {{htmlLabel}}
                              </label>
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
                        <div class="form-check ms-3">
                            <!-- auto-switch match all -->
                            <input type="checkbox" class="form-check-input" id="signatureModalAutoSwitchMatchAll-{{id}}"{{#autoSwitchMatchAll}} checked{{/autoSwitchMatchAll}}>
                            <label class="form-check-label" for="signatureModalAutoSwitchMatchAll-{{id}}">{{autoSwitchMatchAllLabel}}</label>
                        </div>
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
