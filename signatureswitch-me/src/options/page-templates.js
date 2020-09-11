const SIGNATURE_ROW = `
    <tr class="hide" data-signature-id="{{id}}">
        <!-- default -->
        <td class="text-truncate" contenteditable="false"><input id="signatureDefault-{{id}}" type="radio" name="defaultSignature" value=""></td>
        <!-- name -->
        <td contenteditable="false"><b id="signatureName-{{id}}">{{name}}</b></td>
        <!-- edit -->
        <td>
            <span class="signaturesTable-edit">
                <button type="button" class="btn btn-primary btn-rounded btn-sm my-0 waves-effect waves-light" data-toggle="modal" data-target="#signatureEditModal-{{id}}">
                    <svg class="bi" width="2em" height="2em" fill="currentColor">
                        <use xlink:href="../_images/bootstrap-icons.svg#pencil"/>
                    </svg>
                </button>
            </span>
        </td>
        <!-- up -->
        <td contenteditable="false">
            <button id="signatureUp-{{id}}" type="button" class="btn btn-light btn-rounded btn-sm my-0 waves-effect waves-light">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="../_images/bootstrap-icons.svg#arrow-up"/>
                </svg>
            </button>
        </td>
        <!-- down -->
        <td contenteditable="false">
            <button id="signatureDown-{{id}}" type="button" class="btn btn-light btn-rounded btn-sm my-0 waves-effect waves-light">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="../_images/bootstrap-icons.svg#arrow-down"/>
                </svg>
            </button>
        </td>
        <!-- remove -->
        <td>
            <span class="signatures-table-remove">
                <button type="button" class="btn btn-danger btn-rounded btn-sm my-0 waves-effect waves-light" data-toggle="modal" data-target="#signatureRemoveModal-{{id}}">
                    <svg class="bi" width="2em" height="2em" fill="currentColor">
                        <use xlink:href="../_images/bootstrap-icons.svg#trash"/>
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
            <form>
              <!-- name -->
              <div class="form-group">
                <label for="signatureModalName-{{id}}">{{nameLabel}}</label>
                <input type="text" class="form-control" id="signatureModalName-{{id}}" placeholder="{{namePlaceholder}}" value="{{name}}">
              </div>
              <!-- text -->
              <div class="form-group">
                <label for="signatureModalText-{{id}}">{{textLabel}}</label>
                <textarea class="form-control" id="signatureModalText-{{id}}" rows="5">{{text}}</textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="../_images/bootstrap-icons.svg#x"/>
                </svg>
                &nbsp;                
                {{close}}
            </button>
            <button id="signatureModalSave-{{id}}" type="button" class="btn btn-primary">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="../_images/bootstrap-icons.svg#check"/>
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
            <button type="button" class="btn btn-secondary" data-dismiss="modal">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="../_images/bootstrap-icons.svg#x"/>
                </svg>
                &nbsp;                
                {{no}}
            </button>
            <button id="signatureRemoveModalSave-{{id}}" type="button" class="btn btn-primary">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="../_images/bootstrap-icons.svg#check"/>
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
    <div class="row mb-2">
        <div class="col-sm-3 text-right">
            <label for="command-{{id}}">{{label}}</label>
        </div>
        <div class="col-sm">
            <input type="text" class="form-control" id="command-{{id}}" value="{{value}}" placeholder="{{placeholder}}">
        </div>
        <div class="col-sm">
            <button type="button" id="command-{{id}}-reset" class="btn btn-warning btn-rounded btn-sm my-0">
                <svg class="bi" width="2em" height="2em" fill="currentColor">
                    <use xlink:href="../_images/bootstrap-icons.svg#arrow-counterclockwise"/>
                </svg>
                &nbsp;
                <span>{{resetButtonText}}</span>
            </button>
        </div>
    </div>
`;
