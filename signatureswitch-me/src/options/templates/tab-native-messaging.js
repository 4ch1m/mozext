const NATIVE_MESSAGING_TAB_PANE = `
    <div class="tab-pane m-2" id="nativeMessagingTabContent" role="tabpanel">
        <div class="section">
            <p>
                <div class="form-row">
                    <label for="testNativeMessagingTag" data-i18n="optionsNativeMessagingTag"></label>
                    <input id="testNativeMessagingTag" type="text" class="form-control" value="test">
                </div>
            </p>
            <p>
                <label for="testNativeMessagingComposeDetails" data-i18n="optionsNativeMessagingComposeDetails"></label>
                <textarea class="form-control" id="testNativeMessagingComposeDetails" rows="10">
                </textarea>
            </p>
            <p>
                <button id="testNativeMessagingButton" type="button" class="btn btn-light btn-sm">
                    <svg class="bi" width="2em" height="2em" fill="currentColor">
                        <use xlink:href="/_images/bootstrap-icons.svg#play-fill"/>
                    </svg>
                    &nbsp;
                    <span data-i18n="optionsNativeMessagingSend"></span>
                </button>
            </p>
        </div>
    </div>
`;
