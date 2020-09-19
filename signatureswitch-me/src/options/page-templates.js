const SIGNATURE_ROW = `
    <tr class="hide" data-signature-id="{{id}}">
        <!-- default -->
        <td contenteditable="false">
            <input id="signatureDefault-{{id}}" type="radio" name="defaultSignature">
        </td>
        <!-- name -->
        <td contenteditable="false">
            <b id="signatureName-{{id}}">{{name}}</b>
        </td>
        <!-- edit -->
        <td contenteditable="false">
            <span class="signaturesTable-edit">
                <button type="button" class="btn btn-light btn-rounded btn-sm my-0 waves-effect waves-light" data-toggle="modal" data-target="#signatureEditModal-{{id}}">
                    <svg class="bi" width="2em" height="2em" fill="currentColor">
                        <use xlink:href="/_images/bootstrap-icons.svg#pencil"/>
                    </svg>
                </button>
            </span>
        </td>
        <!-- up -->
        <td contenteditable="false">
            <button id="signatureUp-{{id}}" type="button" class="btn btn-light btn-rounded btn-sm my-0 waves-effect waves-light">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="/_images/bootstrap-icons.svg#arrow-up"/>
                </svg>
            </button>
        </td>
        <!-- down -->
        <td contenteditable="false">
            <button id="signatureDown-{{id}}" type="button" class="btn btn-light btn-rounded btn-sm my-0 waves-effect waves-light">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="/_images/bootstrap-icons.svg#arrow-down"/>
                </svg>
            </button>
        </td>
        <!-- remove -->
        <td contenteditable="false">
            <span class="signatures-table-remove">
                <button type="button" class="btn btn-light btn-rounded btn-sm my-0 waves-effect waves-light" data-toggle="modal" data-target="#signatureRemoveModal-{{id}}">
                    <svg class="bi" width="2em" height="2em" fill="currentColor">
                        <use xlink:href="/_images/bootstrap-icons.svg#trash"/>
                    </svg>
                </button>
            </span>
        </td>
    </tr>
`;

const SIGNATURE_EDIT_MODAL = `
    <div class="modal fade" id="signatureEditModal-{{id}}" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{title}}</h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div>
                        <label for="signatureModalName-{{id}}">
                            {{nameLabel}}
                            <span data-toggle="tooltip" title="{{nameTooltip}}">
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
                            <span data-toggle="tooltip" title="{{contentTooltip}}">
                                <svg class="bi" width="1em" height="1em" fill="currentColor">
                                    <use xlink:href="/_images/bootstrap-icons.svg#info-circle"/>
                                </svg>
                            </span>
                        </label>
                        <div id="signatureEditAccordion-{{id}}">
                            <div class="card">
                                <div class="card-header" id="signatureEditAccordionPlaintext-{{id}}">
                                    <h5 class="mb-0">
                                        <button class="btn btn-block btn-link" data-toggle="collapse" data-target="#signatureEditCollapsePlaintext-{{id}}">
                                            {{textHeading}}
                                        </button>
                                    </h5>
                                </div>
                                <div id="signatureEditCollapsePlaintext-{{id}}" class="collapse show" data-parent="#signatureEditAccordion-{{id}}">
                                    <div class="card-body bg-light">
                                        <!-- text -->
                                        <textarea class="form-control" id="signatureModalText-{{id}}" rows="5">{{text}}</textarea>
                                    </div>
                                </div>
                            </div>
                            <div class="card">
                                <div class="card-header" id="signatureEditAccordionHtml-{{id}}">
                                    <h5 class="mb-0">
                                        <button class="btn btn-block btn-link collapsed" data-toggle="collapse" data-target="#signatureEditCollapseHtml-{{id}}">
                                            {{htmlHeading}}
                                        </button>
                                    </h5>
                                </div>
                                <div id="signatureEditCollapseHtml-{{id}}" class="collapse" data-parent="#signatureEditAccordion-{{id}}">
                                    <div class="card-body bg-light">
                                        <!-- HTML -->
                                        <textarea class="form-control" id="signatureModalHtml-{{id}}" rows="5">{{html}}</textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3">
                        <label for="signatureModalAutoSwitch-{{id}}">
                            {{autoSwitchLabel}}
                            <span data-toggle="tooltip" title="{{autoSwitchTooltip}}">
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
                    <button type="button" class="btn btn-light" data-dismiss="modal">
                        <svg class="bi" width="2em" height="2em" fill="currentColor">
                            <use xlink:href="/_images/bootstrap-icons.svg#x"/>
                        </svg>
                        &nbsp;
                        {{close}}
                    </button>
                    <button id="signatureModalSave-{{id}}" type="button" class="btn btn-light">
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

const SIGNATURE_REMOVE_MODAL = `
    <div class="modal fade" id="signatureRemoveModal-{{id}}" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{title}}</h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    {{question}}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-dismiss="modal">
                        <svg class="bi" width="2em" height="2em" fill="currentColor">
                            <use xlink:href="/_images/bootstrap-icons.svg#x"/>
                        </svg>
                        &nbsp;
                        {{no}}
                    </button>
                    <button id="signatureRemoveModalSave-{{id}}" type="button" class="btn btn-light">
                        <svg class="bi" width="2em" height="2em" fill="currentColor">
                            <use xlink:href="/_images/bootstrap-icons.svg#check"/>
                        </svg>
                        &nbsp;
                        {{yes}}
                    </button>
                </div>
            </div>
        </div>
    </div>
`;

const COMMAND_ROW = `
    <div class="form-row mb-2">
        <div class="col-sm-2 text-right">
            <label class="nobr" for="command-{{id}}">{{label}}</label>
        </div>
        <div class="col-sm">
            <input type="text" class="form-control" id="command-{{id}}" value="{{value}}" placeholder="{{placeholder}}">
        </div>
        <div class="col-sm">
            <button type="button" id="command-{{id}}-reset" class="btn btn-light btn-rounded btn-sm my-0">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="/_images/bootstrap-icons.svg#arrow-counterclockwise"/>
                </svg>
                &nbsp;
                <span>{{resetButtonText}}</span>
            </button>
        </div>
    </div>
`;
