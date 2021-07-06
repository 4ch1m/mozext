const NATIVE_MESSAGING_TAB_PANE = `
    <div class="tab-pane m-2" id="nativeMessagingTabContent" role="tabpanel">
        <div class="container">
            <!-- descriptions -->
            <div class="row mt-3">
                <span data-i18n="nativeMessagingDescription1"></span><br>
                <span data-i18n="nativeMessagingDescription2"></span>
            </div>
            <div class="row mt-3">
                <span data-i18n="nativeMessagingDescription3"></span><br>
                <small><small>
                    <a id="nativeMessagingGithubLink" class="m-2" href="https://github.com/4ch1m/mozext/tree/master/signatureswitch-me/native_messaging" target="_blank"></a>
                </small></small>
            </div>
            <!-- usage -->
            <div class="row mt-3">
                <u data-i18n="nativeMessagingUsageHeader"></u><br>
                <span data-i18n="nativeMessagingUsageDescription"></span><br>
                <span class="mt-2" data-i18n="nativeMessagingUsageExample"></span><br>
                <div class="ms-3">
                    <pre><code data-i18n="nativeMessagingUsageCode"></code></pre>
                </div>
            </div>
            <div class="row">
                <span data-i18n="nativeMessagingTestHint"></span>
            </div>
            <hr class="w-100">
            <!-- test area -->
            <div class="row">
                <h3 data-i18n="nativeMessagingTestHeader"></h3>            
            </div>
            <!-- message -->
            <div class="row align-items-end mt-3">
                <div class="col-md-10">
                    <p>
                        <label for="nativeMessagingMessage" data-i18n="nativeMessagingMessage"></label>
                        <span id="nativeMessagingMessageTooltip"> <!-- tooltip added programmatically -->
                            <svg class="bi" width="1em" height="1em" fill="currentColor">
                                <use xlink:href="/_images/bootstrap-icons.svg#info-circle"/>
                            </svg>
                        </span>
                    </p>
                    <p>
                        <textarea class="form-control" id="nativeMessagingMessage" rows="10"></textarea>
                    </p>
                </div>
                <div class="col-md-2">
                    <b><span id="nativeMessagingMessageValidation"></span></b>
                </div>
            </div>
            <!-- send button -->
            <div class="row">
                <div>
                    <button id="nativeMessagingSendButton" type="button" class="btn btn-primary btn-sm">
                        <svg class="bi" width="2em" height="2em" fill="currentColor">
                            <use xlink:href="/_images/bootstrap-icons.svg#play-fill"/>
                        </svg>
                        &nbsp;
                        <span data-i18n="nativeMessagingSend"></span>
                    </button>
                </div>
            </div>
            <!-- response -->
            <div class="row mt-3 align-items-end">
                <div class="col-md-10">
                    <p>
                        <label for="nativeMessagingResponse" data-i18n="nativeMessagingResponse"></label>
                        <span id="nativeMessagingResponseTooltip"> <!-- tooltip added programmatically -->
                            <svg class="bi" width="1em" height="1em" fill="currentColor">
                                <use xlink:href="/_images/bootstrap-icons.svg#info-circle"/>
                            </svg>
                        </span>
                    </p>
                    <p>
                        <textarea class="form-control" id="nativeMessagingResponse" rows="10" readonly></textarea>
                    </p>
                </div>
                <div class="col-md-2">
                    <b><span id="nativeMessagingResponseValidation"></span></b>
                </div>
            </div>
        </div>
    </div>
`;
