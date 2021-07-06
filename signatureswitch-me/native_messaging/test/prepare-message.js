#!/usr/bin/node

let inputFile = process.argv[2];
let outputFile = process.argv[3];

const fs = require("fs");
const offset = 4; // 4 bytes at the beginning of the outgoing message; used to store actual message length

let message = fs.readFileSync(inputFile, {encoding: "utf8", flag: "r"});
let messageLength = Buffer.byteLength(message, "utf8");

let buffer = Buffer.alloc(offset + messageLength);
buffer.writeUInt32LE(messageLength, 0);
buffer.write(message, offset, "utf8");

fs.writeFileSync(outputFile, buffer);
