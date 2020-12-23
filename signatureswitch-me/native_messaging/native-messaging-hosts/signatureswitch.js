#!/usr/bin/node

const OFFSET = 4; // 4 bytes at the beginning of the outgoing message; used to store actual message length

require("fs").appendFile("/tmp/test.txt", "native app triggered.\n", () => {});

function createReturnMessage(message) {
    let messageLength = Buffer.byteLength(message, "utf8");

    let buffer = Buffer.alloc(OFFSET + messageLength);
    buffer.writeUInt32LE(messageLength, 0);
    buffer.write(message, OFFSET, "utf8");

    return buffer;
}

let message = require("fs").readFileSync(0); // STDIN_FILENO = 0
let messageSize = message.readUInt32LE(0);
let messageContent = message.slice(OFFSET, (messageSize + OFFSET));

let messageJson = JSON.parse(messageContent);

process.stdout.write(createReturnMessage(JSON.stringify({
    message: "SUCCESS! Your tag was: " + messageJson.tag
})));
