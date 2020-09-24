const ON_OFF_BUTTON = `
    <button id="onOffButton" type="button" class="btn {{class}} btn-sm btn-block mt-1">
        <svg class="bi" width="1em" height="1em" fill="currentColor">
            <use xlink:href="/_images/bootstrap-icons.svg#{{image}}"/>
        </svg>
        {{text}}
    </button>
`;

const SIGNATURE_BUTTON = `
    <button id="signatureButton-{{id}}" type="button" class="btn btn-light btn-sm btn-block mt-2">
        {{name}}
    </button>
`;
