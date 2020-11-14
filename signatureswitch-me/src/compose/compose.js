browser.runtime.onMessage.addListener(request => {

    switch (request.type) {

        case "appendSignature":
            let signatureElement = document.createElement(request.value.type);
            addClassesAndAttributesToElement(signatureElement, request.value.classes, request.value.attributes);
            if (request.value.prepend) {
                let prependElement = document.createElement(request.value.prepend.type);
                addClassesAndAttributesToElement(prependElement, request.value.prepend.classes, request.value.prepend.attributes);
                document.body.appendChild(prependElement);
            }
            signatureElement.innerHTML = request.value.content;
            document.body.appendChild(signatureElement);
            break;

        case "removeSignature":
            let removableSignatures = document.querySelectorAll(request.value);
            if (removableSignatures.length > 0) {
                removableSignatures[removableSignatures.length - 1].remove();
            }
            break;

        case "searchSignature":
            let foundSignatureId = "";
            let existingSignatures = document.querySelectorAll(request.value.selector);
            if (existingSignatures.length > 0) {
                foundSignatureId = existingSignatures[existingSignatures.length - 1].getAttribute(request.value.idAttribute);
            }
            return Promise.resolve({signatureId: foundSignatureId});

        default:
            console.log("compose script: invalid message type!");
    }

});

function addClassesAndAttributesToElement(element, classes, attributes) {
    if (classes) {
        for (let clazz of classes) {
            element.classList.add(clazz);
        }
    }
    if (attributes) {
        for (let attribute of attributes) {
            element.setAttribute(attribute.key, attribute.value);
        }
    }
}
