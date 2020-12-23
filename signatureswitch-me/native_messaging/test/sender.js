#!/usr/bin/node

// this program "mocks" the call from Thunderbird (triggered by the Signature Switch add-on)

const OFFSET = 4; // 4 bytes at the beginning of the outgoing message; used to store actual message length

let data = JSON.stringify({
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

process.stdout.write(createMessageBuffer(data));
