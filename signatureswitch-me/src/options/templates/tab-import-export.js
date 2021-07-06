const IMPORT_EXPORT_TAB_PANE = `
    <div class="tab-pane m-2" id="importExportTabContent" role="tabpanel">
        <div class="container">
            <div class="row mt-3">
                <div class="col-md-auto alert bg-warning" role="alert">
                    <span data-i18n="optionsImportExportDescription1"></span><br>
                    <br>
                    <b data-i18n="optionsImportExportDescription2"></b>
                </div>
            </div>
            <div class="row">
                <label for="importExportData">
                    <span data-i18n="optionsImportExportDataLabel"></span>
                </label>
                <textarea class="form-control" id="importExportData" rows="10" spellcheck="false"></textarea>
            </div>
            <div class="row mt-3">
                <div class="col-md-6 nobr">
                    <button id="importSignatures" type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#importExportConfirmationModal" disabled>
                        <svg class="bi" width="2em" height="2em" fill="currentColor">
                            <use xlink:href="/_images/bootstrap-icons.svg#download"/>
                        </svg>
                        &nbsp;
                        <span data-i18n="optionsImportExportImport"></span>
                    </button>
                    <button id="exportSignatures" type="button" class="btn btn-primary btn-sm">
                        <svg class="bi" width="2em" height="2em" fill="currentColor">
                            <use xlink:href="/_images/bootstrap-icons.svg#upload"/>
                        </svg>
                        &nbsp;
                        <span data-i18n="optionsImportExportExport"></span>
                    </button>
                    <button id="copySignaturesToClipboard" type="button" class="btn btn-primary btn-sm">
                        <svg class="bi" width="2em" height="2em" fill="currentColor">
                            <use xlink:href="/_images/bootstrap-icons.svg#clipboard-plus"/>
                        </svg>
                        &nbsp;
                        <span data-i18n="optionsImportExportClipboard"></span>
                    </button>
                </div>
                <div class="col-md-6 float-right text-end">
                    <b><span id="importExportDataValidation"></span></b>
                </div>
            </div>
            <!-- modals -->
            <span id="importExportModals">
            </span>
        </div>
    </div>
`;
