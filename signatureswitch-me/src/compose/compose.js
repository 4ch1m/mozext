browser.runtime.onMessage.addListener(request => {

    switch (request.type) {

        case "ping":
            return Promise.resolve("pong");

        case "appendSignature":
            if (request.value.prepend) {
                document.body.appendChild(createElement(request.value.prepend));
            }

            let citeOrForward = document.querySelectorAll(".moz-cite-prefix,blockquote[type='cite'],.moz-forward-container");

            if (request.value.signature.aboveQuoteOrForwarding && citeOrForward.length > 0) {
                citeOrForward[0].parentElement.insertBefore(createElement(request.value.signature), citeOrForward[0]);
            } else {
                document.body.appendChild(createElement(request.value.signature));
            }

            if (request.value.postpend) {
                document.body.appendChild(createElement(request.value.postpend));
            }

            break;

        case "removeSignature":
            let removableSignatures = document.querySelectorAll(request.value.selector);

            if (removableSignatures.length > 0) {
                removableSignatures[removableSignatures.length - 1].remove();
            } else {
                // if removal was not possible via attribute/class; fall back to sig-separator
                // (this is primarily for saved plaintext drafts, which - after saving/upon re-edit - don't contain the original signature classes/attributes in the DOM any more)
                if (document.body.innerHTML.includes(request.value.separator)) {
                    document.body.innerHTML = document.body.innerHTML.substring(0, document.body.innerHTML.lastIndexOf(request.value.separator));
                }
            }

            break;

        case "cleanUp":
            document.querySelectorAll(request.value.selector).forEach(element => {
                element.remove();
            });

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

function createElement(properties) {
    let element = document.createElement(properties.type);

    if (properties.classes) {
        properties.classes.forEach(clazz => {
            element.classList.add(clazz);
        });
    }

    if (properties.attributes) {
        properties.attributes.forEach(attribute => {
            element.setAttribute(attribute.key, attribute.value);
        });
    }

    if (properties.innerHtml) {
        element.innerHTML = properties.innerHtml;
    }

    return element;
}
