const SIGNATURE_ROW = `
    <tr class="hide" data-signature-id="{{id}}">
        <!-- default -->
        <td>
            <input id="signatureDefault-{{id}}" type="radio" name="defaultSignature">
        </td>
        <!-- name -->
        <td>
            <b id="signatureName-{{id}}">{{name}}</b>
        </td>
        <!-- edit -->
        <td>
            <span class="signaturesTable-edit">
                <button type="button" class="btn btn-light btn-sm" data-toggle="modal" data-target="#signatureEditModal-{{id}}">
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
            <button type="button" class="btn btn-light btn-sm" data-toggle="modal" data-target="#signatureRemoveModal-{{id}}">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="/_images/bootstrap-icons.svg#trash"/>
                </svg>
            </button>
        </td>
    </tr>
`;

const SIGNATURE_EDIT_MODAL = `
    <div class="modal fade" id="signatureEditModal-{{id}}" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
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
                                        <textarea class="form-control" id="signatureModalText-{{id}}" rows="5" spellcheck="false" placeholder="{{textPlaceholder}}">{{text}}</textarea>
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
                                        <textarea class="form-control" id="signatureModalHtml-{{id}}" rows="5" spellcheck="false" placeholder="{{htmlPlaceholder}}">{{html}}</textarea>
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

const GENERIC_REMOVE_MODAL = `
    <div class="modal fade" id="{{modalId}}" tabindex="-1" role="dialog">
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
                    <button id="{{modalYesButtonId}}" type="button" class="btn btn-light">
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
        <div class="col-sm nobr">
            <select id="command-{{id}}-modifier1" class="custom-select custom-select-sm" style="width:auto">
                {{{modifierOptions1}}}
            </select>      
            +  
            <select id="command-{{id}}-modifier2" class="custom-select custom-select-sm" style="width:auto">
                {{{modifierOptions2}}}
            </select>
            +        
            <select id="command-{{id}}-key" class="custom-select custom-select-sm" style="width:auto">
                {{{keyOptions}}}
            </select>
            &nbsp;        
            <button type="button" id="command-{{id}}-reset" class="btn btn-light btn-sm">
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

const IMAGES_ROW = `
    <tr class="hide" data-image-id="{{id}}">
        <!-- name -->
        <td>
            <input id="imageName-{{id}}" type="text" class="form-control w-100" value="{{name}}" placeholder="{{namePlaceholder}}">
        </td>
        <!-- tag -->
        <td>
            <input id="imageTag-{{id}}" type="text" class="form-control w-100" value="{{tag}}" placeholder="{{tagPlaceholder}}">
        </td>
        <!-- image -->
        <td>
            <div class="w-20 nobr">
                <img id="imageDisplay-{{id}}" src="{{data}}" width="50px" height="50px">
                <input type="file" accept="image/*" id="imageFileInput-{{id}}" class="{{class}}">
            </div>
        </td>
        <!-- remove -->
        <td>
            <button type="button" class="btn btn-light btn-sm" data-toggle="modal" data-target="#imageRemoveModal-{{id}}">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="/_images/bootstrap-icons.svg#trash"/>
                </svg>
            </button>
        </td>
    </tr>
`;

const FORTUNE_COOKIES_ROW = `
    <tr class="hide" data-fortunecookies-id="{{id}}">
        <!-- name -->
        <td>
            <input id="fortuneCookiesName-{{id}}" type="text" class="form-control w-100" value="{{name}}" placeholder="{{namePlaceholder}}">
        </td>
        <!-- tag -->
        <td>
            <input id="fortuneCookiesTag-{{id}}" type="text" class="form-control w-100" value="{{tag}}" placeholder="{{tagPlaceholder}}">
        </td>
        <!-- content -->
        <td>
            <textarea id="fortuneCookiesCookies-{{id}}" type="text" class="form-control w-100" rows="1" readonly>{{cookies}}</textarea>
        </td>
        <!-- remove -->
        <td>
            <button type="button" class="btn btn-light btn-sm" data-toggle="modal" data-target="#fortuneCookiesRemoveModal-{{id}}">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="/_images/bootstrap-icons.svg#trash"/>
                </svg>
            </button>
        </td>
    </tr>
`;

const FORTUNE_COOKIES_EDIT_MODAL = `
    <div class="modal fade" id="fortuneCookiesEditModal-{{id}}" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{title}}</h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div>
                        <label for="fortuneCookiesEditModalCookies-{{id}}">
                            {{cookiesLabel}}
                            <span data-toggle="tooltip" title="{{cookiesTooltip}}">
                                <svg class="bi" width="1em" height="1em" fill="currentColor">
                                    <use xlink:href="/_images/bootstrap-icons.svg#info-circle"/>
                                </svg>
                            </span>
                        </label>
                        <textarea class="form-control" id="fortuneCookiesEditModalCookies-{{id}}" rows="10" spellcheck="false" placeholder="{{cookiesPlaceholder}}">{{cookies}}</textarea>
                    </div>
                    <div class="mt-3">
                        <span>{{fileImportLabel}}</span>
                        <input type="file" accept="text/plain" id="fortuneCookiesFileInput-{{id}}">
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
                    <button id="fortuneCookiesEditModalSave-{{id}}" type="button" class="btn btn-light">
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

const IDENTITIES_ROW = `
    <tr class="hide">
        <!-- name -->
        <td class="text-center">
            <b class="nobr">{{name}}</b>
        </td>
        <!-- signature -->
        <td class="text-center">
            <select id="identity-{{id}}-signature" class="custom-select custom-select-sm" style="width:auto">
                {{{signatures}}}
            </select>
        </td>
    </tr>
`;
