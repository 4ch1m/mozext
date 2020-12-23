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

let messageString = require("fs").readFileSync(0, "utf8");
let messageByteLength = Buffer.byteLength(messageString, "utf8");
let messageBuffer = Buffer.alloc(messageByteLength, messageString);

let messagePayloadSize = messageBuffer.readUInt32LE(0);
let messagePayload = messageBuffer.slice(OFFSET, (messagePayloadSize + OFFSET));

let messageJson = JSON.parse(messagePayload);

let returnMessage = createReturnMessage(JSON.stringify({
    message: "SUCCESS! The message's tag was: " + messageJson.tag
}));

process.stdout.write(returnMessage);
