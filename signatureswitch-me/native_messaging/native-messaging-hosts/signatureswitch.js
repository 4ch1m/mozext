#!/usr/bin/node

/*
    A small example application for receiving/sending "native messaging data" from Signature Switch (Thunderbird).

    Based on the example found here:
        https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging
 */

(() => {
    let done = false;
    let payloadSize = null;
    let chunks = [];

    const sizeHasBeenRead = () => Boolean(payloadSize);

    const flushChunksQueue = () => {
        payloadSize = null;
        chunks.splice(0);
    };

    const processData = () => {
        const stringData = Buffer.concat(chunks);

        if (!sizeHasBeenRead()) {
            payloadSize = stringData.readUInt32LE(0);
        }

        if (stringData.length >= (payloadSize + 4)) {
            const contentWithoutSize = stringData.slice(4, (payloadSize + 4));

            flushChunksQueue();

            const json = JSON.parse(contentWithoutSize);

            // *********************************************************************************************************
            // at this point the received message can be evaluated; creating a custom/dynamic response message ...

            process.stdout.write(createReturnMessage(JSON.stringify({
                message: `It worked! The used tag was '${json.tag}'. Your mail is of type '${json.type}' and being composed in ${json.isPlainText ? "plaintext" : "HTML"} mode.`
            })));

            // *********************************************************************************************************

            done = true;
        }
    };

    const createReturnMessage = message => {
        let messageLength = Buffer.byteLength(message, "utf8");

        let buffer = Buffer.alloc(4 + messageLength, "", "utf8");
        buffer.writeUInt32LE(messageLength);
        buffer.write(message, 4, "utf8");

        return buffer;
    };

    process.stdin.on("readable", () => {
        let chunk = null;

        while ((chunk = process.stdin.read()) !== null) {
            chunks.push(chunk);
        }

        if (!done) {
            processData();
        }
    });
})();
