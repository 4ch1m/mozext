const BODY = `
    <!-- header -->
    <h1>
        <span data-i18n="optionsHeader|$extensionName"></span>
        &nbsp;
        <small>
            <small class="text-muted" data-i18n="optionsHeaderSecondary"></small>
        </small>
    </h1>
    
    <!-- content -->
    <section class="options-tab">
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <nav>
                        <div id="optionsNav" class="nav nav-tabs nav-fill" role="tablist">
                            {{#navItems}}
                                <a class="nav-item nav-link {{status}}" id="{{id}}" data-bs-toggle="tab" href="{{href}}" type="button" role="tab" data-i18n="{{i18n}}"></a>
                            {{/navItems}}
                        </div>
                    </nav>
                    <div class="tab-content">
                        {{#tabPanes}}
                            {{{.}}}
                        {{/tabPanes}}
                    </div>
                </div>
            </div>
        </div>
    </section>
`;
