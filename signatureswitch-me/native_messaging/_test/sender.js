#!/usr/bin/node

// this program "mocks" the call from Thunderbird (triggered by the Signature Switch add-on)

const OFFSET = 4; // 4 bytes at the beginning of the outgoing message; used to store actual message length

let data = JSON.stringify({
    module: 'phone_number.py',
    composeDetails: {
        to: [ "moe@zilla","test@test.com" ]
    }
});

function createMessageBuffer(message) {
    let messageLength = Buffer.byteLength(message);

    let buffer = Buffer.alloc(OFFSET + messageLength);
    buffer.writeUInt32LE(messageLength, 0);
    buffer.write(message, OFFSET);

    return buffer;
}

process.stdout.write(createMessageBuffer(data));
