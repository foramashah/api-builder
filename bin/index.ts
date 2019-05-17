#!/usr/bin/env node
import * as path from "path";
import { builder } from "../lib/builder";

async function processTemplate(...args: string[]): Promise<void> {
    try {
        var templateConfigFilePath = args && args.length > 0 ? args[0] : process.argv[2];
        if (!path.isAbsolute(templateConfigFilePath)) {
            templateConfigFilePath = path.join(process.cwd(), templateConfigFilePath);
        }
        console.log(`Tempalte config file: ${templateConfigFilePath}`);
        builder.build(templateConfigFilePath);
    }
    catch (ex) {
        console.log(`Error: `, ex);
    }   
}

processTemplate();