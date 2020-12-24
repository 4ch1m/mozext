#!/usr/bin/node

// this program simulates the "sendNativeMessage"-call from Thunderbird to the native app;
// sending the message via STDIN ; receiving the answer via STDOUT

const OFFSET = 4; // 4 bytes at the beginning of the outgoing message; used to store actual message length

let message = JSON.stringify({
    tag: "test",
    composeDetails: {
        to: "<moe@zilla.org>",
        subject: "test"
    }
});

function createMessageBuffer(message) {
    let messageLength = Buffer.byteLength(message, "utf8");

    let buffer = Buffer.alloc(OFFSET + messageLength);
    buffer.writeUInt32LE(messageLength, 0);
    buffer.write(message, OFFSET, "utf8");

    return buffer;
}

function handleResponse(data) {
    let dataLength = Buffer.byteLength(data, "utf8");
    let dataBuffer = Buffer.alloc(dataLength, data);
    let dataPayloadSize = dataBuffer.readUInt32LE(0);
    let dataPayload = dataBuffer.slice(OFFSET, (dataPayloadSize + OFFSET));

    console.log("the app returned: " + dataPayload);
}

let appProcess = require("child_process").spawn("../native-messaging-hosts/signatureswitch.js");
appProcess.stdin.setEncoding("utf-8");
appProcess.stdout.on("data", handleResponse);
appProcess.stdin.write(createMessageBuffer(message).toString("utf8"));
appProcess.stdin.end();
