#!/usr/bin/env node

const copy = require("copy");
const opts = { flatten: true };

const callback = (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
};

copy.each([
    "node_modules/bootstrap/dist/css/bootstrap.min.css",
    "node_modules/bootstrap/dist/css/bootstrap.min.css.map",
    "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
    "node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map",
    "node_modules/jquery/dist/jquery.min.js",
    "node_modules/mdbootstrap/css/mdb.min.css",
    "node_modules/mdbootstrap/css/mdb.min.css.map",
    "node_modules/mdbootstrap/js/mdb.min.js",
    "node_modules/mdbootstrap/js/mdb.min.js.map",
    "node_modules/@popperjs/core/dist/umd/popper.min.js",
    "node_modules/@popperjs/core/dist/umd/popper.min.js.map",
    "node_modules/uuid/dist/umd/uuidv4.min.js",
    "node_modules/mustache/mustache.min.js"
], "src/_libraries/", opts, callback);

copy("node_modules/bootstrap-icons/bootstrap-icons.svg", "src/_images/", opts, callback);
