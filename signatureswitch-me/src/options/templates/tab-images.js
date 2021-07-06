const IMAGES_TAB_PANE = `
    <div class="tab-pane m-2" id="imagesTabContent" role="tabpanel">
        <div class="container">
            <div class="row mt-3">
                <div id="imagesTable">
                    <table class="table table-bordered text-center">
                        <thead class="table-dark">
                            <tr>
                                <!-- name -->
                                <th class="w-25 text-center" data-i18n="optionsTableColumnImagesName"></th>
                                <!-- tag -->
                                <th class="w-20 text-center" data-i18n="optionsTableColumnImagesTag"></th>
                                <!-- image -->
                                <th class="w-auto text-center" data-i18n="optionsTableColumnImagesImage"></th>
                                <!-- delete -->
                                <th class="w-auto text-center" data-i18n="optionsTableColumnImagesDelete"></th>
                            </tr>
                        </thead>
                        <tbody id="imagesTableBody">
                            <!-- images ... -->
                        </tbody>
                    </table>
                    <!-- add -->
                    <span id="imageAdd">
                        <button type="button" class="btn btn-primary btn-sm">
                            <svg class="bi" width="2em" height="2em" fill="currentColor">
                                <use xlink:href="/_images/bootstrap-icons.svg#plus"/>
                            </svg>
                            &nbsp;
                            <span data-i18n="optionsAddImage"></span>
                        </button>
                    </span>
                </div>
                <!-- modals -->
                <span id="imageModals">
                </span>
            </div>
            <!-- image usage -->
            <div class="row mt-3">
                <div>
                    <u data-i18n="optionsImageUsageHeader"></u><br>
                    <ul>
                        <li data-i18n="optionsImageUsage1"></li>
                        <li data-i18n="optionsImageUsage2"></li>
                        <li data-i18n="optionsImageUsage3"></li>
                        <li data-i18n="optionsImageUsage4"></li>
                        <li data-i18n="optionsImageUsage5"></li>
                    </ul>
                    <span data-i18n="optionsImageUsageExample"></span><br>
                    <div class="ms-3">
                        <pre><code data-i18n="optionsImageUsageExampleCode"></code></pre>
                    </div>
                </div>
            </div>
            <hr class="w-100">
            <!-- image usage - note -->
            <div class="row">
                <b data-i18n="optionsImageUsageNote"></b>
            </div>
        </div>
    </div>
`;

const IMAGES_ROW = `
    <tr data-image-id="{{id}}">
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
                <input type="file" accept="image/*" id="imageFileInput-{{id}}" class="{{fileInputClass}}">
            </div>
        </td>
        <!-- remove -->
        <td>
            <button type="button" class="btn btn-light btn-sm" data-bs-toggle="modal" data-bs-target="#imageRemoveModal-{{id}}">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="/_images/bootstrap-icons.svg#trash"/>
                </svg>
            </button>
        </td>
    </tr>
`;
