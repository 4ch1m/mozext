let rewire = require("rewire");
let background = rewire("../src/background/background.js")

let genericTagReplacer = background.__get__("genericTagReplacer");

test("genericTagReplacer_images", async () => {
    expect(await genericTagReplacer(`
        My HTML signature.
        <hr>
        <img src="{{ logo }}"><br>
        <img src="{{ unknown_logo }}"><br>
        <img src="{{logo}}">
    `, background.__get__("REGEXP_IMAGES"), tag => {
        switch(tag.trim()) {
            case "logo":
                return "data:...";
            default:
                return "unknown";
        }
    })).toBe(`
        My HTML signature.
        <hr>
        <img src="data:..."><br>
        <img src="unknown"><br>
        <img src="data:...">
    `);
});

test("genericTagReplacer_cookies", async () => {
    expect(await genericTagReplacer(`
        Fortune-cookie of the day: [[ chuck ]]
        Bonus cookie: [[chuck]]
        Unknown cookie: [[unknown]]
    `, background.__get__("REGEXP_FORTUNE_COOKIES"), tag => {
        switch(tag.trim()) {
            case "chuck":
                return "norris";
            default:
                return "";
        }
    })).toBe(`
        Fortune-cookie of the day: norris
        Bonus cookie: norris
        Unknown cookie: 
    `);
});

test("genericTagReplacer_native_messaging", async () => {
    expect(await genericTagReplacer(`
        This is my uptime:
        __uptime__
        ________________________________________
        This is my IP:
        __ IP __
        __
        Uptime again:
        __ uptime __
        __ not found:
        __ not_found __
    `, background.__get__("REGEXP_NATIVE_MESSAGING"), tag => {
        switch(tag.trim()) {
            case "uptime":
                return "42 days";
            case "IP":
                return "666";
            default:
                return "";
        }
    })).toBe(`
        This is my uptime:
        42 days
        ________________________________________
        This is my IP:
        666
        __
        Uptime again:
        42 days
        __ not found:
        
    `);
});
