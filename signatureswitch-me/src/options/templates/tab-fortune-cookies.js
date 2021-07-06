const FORTUNE_COOKIES_TAB_PANE = `
    <div class="tab-pane m-2" id="fortuneCookiesTabContent" role="tabpanel">
        <div class="container">
            <div class="row mt-3">
                <div id="fortuneCookiesTable">
                    <table class="table table-bordered text-center">
                        <thead class="table-dark">
                        <tr>
                            <!-- name -->
                            <th class="w-25 text-center" data-i18n="optionsTableColumnFortuneCookiesName"></th>
                            <!-- tag -->
                            <th class="w-25 text-center" data-i18n="optionsTableColumnFortuneCookiesTag"></th>
                            <!-- content -->
                            <th class="w-20 text-center" data-i18n="optionsTableColumnFortuneCookiesFortuneCookies"></th>
                            <!-- delete -->
                            <th class="w-auto text-center" data-i18n="optionsTableColumnFortuneCookiesDelete"></th>
                        </tr>
                        </thead>
                        <tbody id="fortuneCookiesTableBody">
                            <!-- fortuneCookies ... -->
                        </tbody>
                    </table>
                    <!-- add -->
                    <span id="fortuneCookiesAdd">
                        <button type="button" class="btn btn-primary btn-sm">
                            <svg class="bi" width="2em" height="2em" fill="currentColor">
                                <use xlink:href="/_images/bootstrap-icons.svg#plus"/>
                            </svg>
                            &nbsp;
                            <span data-i18n="optionsAddFortuneCookies"></span>
                        </button>
                    </span>
                </div>
                <!-- modals -->
                <span id="fortuneCookiesModals">
                </span>
            </div>
            <!-- fortune cookies usage -->
            <div class="row mt-3">
                <div>
                    <u data-i18n="optionsFortuneCookiesUsageHeader"></u><br>
                    <ul>
                        <li data-i18n="optionsFortuneCookiesUsage1"></li>
                        <li data-i18n="optionsFortuneCookiesUsage2"></li>
                        <li data-i18n="optionsFortuneCookiesUsage3"></li>
                        <li data-i18n="optionsFortuneCookiesUsage4"></li>
                        <li data-i18n="optionsFortuneCookiesUsage5"></li>
                    </ul>
                    <span data-i18n="optionsFortuneCookiesUsageExample"></span><br>
                    <div class="ms-3">
                        <pre><code data-i18n="optionsFortuneCookiesUsageExampleCode"></code></pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;


const FORTUNE_COOKIES_ROW = `
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
        <button type="button" class="btn btn-light btn-sm" data-bs-toggle="modal" data-bs-target="#fortuneCookiesRemoveModal-{{id}}">
            <svg class="bi" width="2em" height="2em" fill="currentColor">
                <use xlink:href="/_images/bootstrap-icons.svg#trash"/>
            </svg>
        </button>
    </td>
`;

const FORTUNE_COOKIES_EDIT_MODAL = `
    <div class="modal fade" id="fortuneCookiesEditModal-{{id}}" data-bs-backdrop="static" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{title}}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div>
                        <label for="fortuneCookiesEditModalCookies-{{id}}">
                            {{cookiesLabel}}
                            <span data-bs-toggle="tooltip" title="{{cookiesTooltip}}">
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
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal">
                        <svg class="bi" width="2em" height="2em" fill="currentColor">
                            <use xlink:href="/_images/bootstrap-icons.svg#x"/>
                        </svg>
                        &nbsp;
                        {{close}}
                    </button>
                    <button id="fortuneCookiesEditModalSave-{{id}}" type="button" class="btn btn-success">
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
