#!/usr/bin/env node
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const builder_1 = require("../lib/builder");
async function processTemplate(...args) {
    try {
        var templateConfigFilePath = args && args.length > 0 ? args[0] : process.argv[2];
        if (!path.isAbsolute(templateConfigFilePath)) {
            templateConfigFilePath = path.join(process.cwd(), templateConfigFilePath);
        }
        console.log(`Tempalte config file: ${templateConfigFilePath}`);
        builder_1.builder.build(templateConfigFilePath);
    }
    catch (ex) {
        console.log(`Error: `, ex);
    }
}
processTemplate();
