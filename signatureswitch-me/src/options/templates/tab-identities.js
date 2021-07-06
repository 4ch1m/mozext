const IDENTITIES_TAB_PANE = `
    <div class="tab-pane m-2" id="identitiesTabContent" role="tabpanel">
        <div class="container">
            <div class="row mt-3">
                <div class="col-12">
                    <input type="checkbox" class="form-check-input" id="identitiesSwitchSignatureOnChange">
                    <label for="identitiesSwitchSignatureOnChange" data-i18n="optionsIdentitiesSwitchSignatureUponChange"></label>
                </div>
                <div class="col-12">
                    <input type="checkbox" class="form-check-input" id="identitiesUseAssignedSignatureOnReplyOrForwarding">
                    <label for="identitiesUseAssignedSignatureOnReplyOrForwarding" data-i18n="optionsIdentitiesUseAssignedSignatureOnReplyOrForwarding"></label>
                </div>
                <div class="col-12">
                    <input type="checkbox" class="form-check-input" id="identitiesOverruleDefaultAction">
                    <label for="identitiesOverruleDefaultAction" data-i18n="optionsIdentitiesOverruleDefaultAction"></label>
                </div>
            </div>
            <div class="row mt-3">
                <label>
                    <span data-i18n="optionsIdentitiesLabel"></span>
                    <span id="identitiesTooltip"> <!-- tooltip added programmatically -->
                        <svg class="bi" width="1em" height="1em" fill="currentColor">
                            <use xlink:href="/_images/bootstrap-icons.svg#info-circle"/>
                        </svg>
                    </span>
                </label>
            </div>
            <div class="row mt-3">
                <div class="col-md-1">
                </div>
                <div class="col-md-8">
                    <table class="table">
                        <thead class="table-dark">
                        <tr>
                            <!-- name -->
                            <th class="w-25 text-center" data-i18n="optionsTableColumnIdentityName"></th>
                            <!-- tag -->
                            <th class="w-25 text-center" data-i18n="optionsTableColumnIdentityAssignedSignature"></th>
                        </tr>
                        </thead>
                        <tbody id="identitiesTableBody">
                            <!-- identities ... -->
                        </tbody>
                    </table>
                    <div class="text-center">
                        <button id="reloadIdentities" type="button" class="btn btn-primary btn-sm">
                            <svg class="bi" width="2em" height="2em" fill="currentColor">
                                <use xlink:href="/_images/bootstrap-icons.svg#arrow-clockwise"/>
                            </svg>
                            &nbsp;
                            <span data-i18n="optionsReloadIdentities"></span>
                        </button>
                    </div>
                </div>
                <div class="col-md-3">
                </div>
            </div>
        </div>
    </div>
`;

const IDENTITIES_ROW = `
    <tr>
        <!-- identity -->
        <td class="text-center">
            <b class="nobr">{{mailIdentity.name}} &lt;{{mailIdentity.email}}&gt;</b>
        </td>
        <!-- signature selector -->
        <td class="text-center">
            <select id="identity-{{mailIdentity.id}}-signature" class="form-select">
                <option></option> <!-- empty -->
                {{#signatures}}
                    <option value="{{value}}" {{status}}>{{text}}</option>
                {{/signatures}}
            </select>
        </td>
    </tr>
`;
