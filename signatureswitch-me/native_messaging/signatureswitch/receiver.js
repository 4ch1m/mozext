#!/usr/bin/node

const OFFSET = 4; // 4 bytes at the beginning of the outgoing message; used to store actual message length

async function readFromStream(stream) {
    let chunks = [];

    for await (let chunk of stream) {
        chunks.push(chunk);
    }

    return Buffer.concat(chunks);
}

function createReturnMessage(message) {
    let messageLength = Buffer.byteLength(message);

    let buffer = Buffer.alloc(OFFSET + messageLength);
    buffer.writeUInt32LE(messageLength, 0);
    buffer.write(message, OFFSET);

    return buffer;
}

(async () => {
        let message = await readFromStream(process.stdin);
        let messageSize = message.readUInt32LE(0);
        let messageContent = message.slice(OFFSET, (messageSize + OFFSET));

        // at this point we basically could do anything with the delivered content;
        // here we have to assume the content is JSON, and parse it;
        // afterwards we extract the "module"-name (which actually is a program) which
        // is to be called, and execute it ...

        let messageJson = JSON.parse(messageContent);
        let modulePath = __dirname + "/modules/" + messageJson.module;

        let output = "";

        let moduleExistsAndIsExecutable = false;

        try {
            const fs = require("fs");

            fs.accessSync(modulePath, fs.constants.X_OK);
            moduleExistsAndIsExecutable = true;
        } catch (err) {
            output = "doesn't exist or is not executable!";
        }

        if (moduleExistsAndIsExecutable) {
            const cp = require("child_process");

            let composeDetailsJson = JSON.stringify(messageJson.composeDetails);
            let spawn = cp.spawn(modulePath, [ composeDetailsJson ]);
            output = (await readFromStream(spawn.stdout)).toString();
        }

        process.stdout.write(createReturnMessage(output));
    }
)();

