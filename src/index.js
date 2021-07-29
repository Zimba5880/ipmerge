"use strict";
exports.__esModule = true;
var ipset_1 = require("./ipset");
var _ipset1 = new ipset_1.ipset("211.137.80.0/20");
var _ipset2 = new ipset_1.ipset("211.137.80.0/22");
var _res = _ipset1.sliceIPs(_ipset2);
// const start = _ipset.start;
// const end = _ipset.end;
if (_res != null) {
    console.log(_res.length);
}
else {
    console.log(null);
}
