"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _indents = [];
function indentation(level) {
    return _indents[level] = _indents[level] || new Array(level).fill("....").join("");
}
function log(level, ...msgs) {
    msgs.forEach(x => console.log(`${indentation(level)}${x}`));
}
exports.log = log;
