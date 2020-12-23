#!/usr/bin/node

const OFFSET = 4; // 4 bytes at the beginning of the outgoing message; used to store actual message length
const fs = require('fs');

function addToLog(msg) {
    fs.appendFile('/tmp/test.txt', msg + "\n", () => {});
}

function createReturnMessage(message) {
    let messageLength = Buffer.byteLength(message);

    let buffer = Buffer.alloc(OFFSET + messageLength);
    buffer.writeUInt32LE(messageLength, 0);
    buffer.write(message, OFFSET);

    return buffer;
}

(async () => {
        addToLog("starting.");

        var message = fs.readFileSync(0); // STDIN_FILENO = 0

        addToLog("message read.");

        let messageSize = message.readUInt32LE(0);

        addToLog("message size: " + messageSize);

        let messageContent = message.slice(OFFSET, (messageSize + OFFSET));

        let messageJson = JSON.parse(messageContent);

        let output = {
            message: "SUCCESS! Your tag was: " + messageJson.tag
        };

        process.stdout.write(createReturnMessage(JSON.stringify(output)));
    }
)();
