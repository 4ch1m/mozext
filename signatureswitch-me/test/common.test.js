let rewire = require("rewire");
let common = rewire("../src/common.js");

let truncateString = common.__get__("truncateString");

test("truncateString", () => {
    expect(truncateString("this is a test", 7)).toBe("this is...");
});
