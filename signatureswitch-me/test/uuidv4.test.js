let path = require("path");
let {readFileSync} = require("fs");

let uuidv4 = readFileSync(path.resolve(__dirname, "../src/_libraries/uuidv4.min.js"), "utf-8");

test("uuidv4", () => {
    expect(uuidv4.includes("uuidv4=")).toBe(true);
});
