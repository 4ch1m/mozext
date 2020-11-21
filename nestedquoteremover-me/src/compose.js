browser.runtime.onMessage.addListener(request => {

    switch (request.type) {

        case "removeNestedQuotes":
            if (request.value.isPlaintext) {
                let removalRegExps = [
                    new RegExp(
                        // matches all quotes larger than max allowed
                        "&gt;".repeat(request.value.maxAllowedQuoteDepth + 1) + ".*",
                        "i")
                ];

                if (request.value.removeQuotedReplyHeader) {
                    removalRegExps.push(
                        new RegExp(
                            // matches all quoted reply headers of the allowed max depth
                            "&gt;".repeat(request.value.maxAllowedQuoteDepth) + " " + request.value.replyHeaderPattern.replaceAll("*", ".*"),
                            "i")
                    );
                }

                processPlaintextQuotes(document.querySelectorAll('[_moz_quote="true"]'), removalRegExps);
            } else {
                processHtmlBlockquotes(
                    document.body.childNodes,
                    { remove: request.value.removeQuotedReplyHeader, pattern: request.value.replyHeaderPattern},
                    request.value.maxAllowedQuoteDepth,
                    1 // top/starting level
                );
            }
            break;

        default:
            console.log("compose script: invalid message type!");

    }

});

function processPlaintextQuotes(mozQuotes, removalRegExps) {
    if (mozQuotes.length > 0) {
        for (let mozQuote of mozQuotes) {
            let mozQuoteLines = mozQuote.innerHTML.split("<br>");
            let newMozQuoteLines = [];
            for (let mozQuoteLine of mozQuoteLines) {
                let remove = false;
                for (let regex of removalRegExps) {
                    if (regex.test(mozQuoteLine)) {
                        remove = true;
                        break;
                    }
                }
                if (!remove) {
                    newMozQuoteLines.push(mozQuoteLine);
                }
            }
            mozQuote.innerHTML = newMozQuoteLines.join('<br _moz_dirty="">');
        }
    }
}

function processHtmlBlockquotes(nodes, replyHeaderHandling, maxDepth, depth) {
    let replyHeaderPattern;
    let replyHeaderSearchRegExp;

    if (replyHeaderHandling.remove) {
        replyHeaderPattern = replyHeaderHandling.pattern.replaceAll("*", ".*");
        replyHeaderSearchRegExp = new RegExp(
            ".*" + replyHeaderPattern + "<br>.*",
            "i");
    }

    for (let node of nodes) {
        if (node.nodeType === Node.ELEMENT_NODE &&
            node.nodeName === "BLOCKQUOTE" &&
            node.hasAttribute("type") && node.getAttribute("type") === "cite") {
            if (depth > maxDepth) {
                node.remove();
            } else {
                processHtmlBlockquotes(node.childNodes, replyHeaderHandling, maxDepth, depth + 1);
            }
        }

        if (replyHeaderHandling.remove && depth > maxDepth) {
            if (replyHeaderSearchRegExp.test(node.innerHTML)) {
                node.innerHTML = node.innerHTML.replaceAll(new RegExp(replyHeaderPattern + "<br>", "g"), "");
            }
        }
    }
}
