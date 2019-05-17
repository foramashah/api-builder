import * as fs from "fs";
import * as path from "path";
import { log } from "./log";
import { ITemplateTokenInfo, ITemplateConfig, ITemplateTokenConfig, IFileSystemTokenResolve } from "./template-config";

class Builder {
    build(templateConfigPath: string) {
        console.log(`Loading template configuration '${templateConfigPath}'...`);
        var templateConfig = this.getTemplateConfig(templateConfigPath);
        console.log(`Processing template configuration...`);
        this.processTemplateConfig(templateConfig);
        console.log(`Generating file(s) and/or folder(s)...`);
    }

    processTemplateConfig(tc: ITemplateConfig, indentLevel: number = 1) {
        tc.sourceTemplatePath = path.normalize(tc.sourceTemplatePath);
        log(indentLevel, `.1. Normalized source tempalte path: ${tc.sourceTemplatePath}`);
        tc.destinationPath = path.normalize(tc.destinationPath);
        log(indentLevel, `.2. Normalized destination path: ${tc.destinationPath}`);
        var sourceTemplateName = path.basename(tc.sourceTemplatePath);
        log(indentLevel, `.3. Checking destination path: '${tc.destinationPath}'`);
        if (!fs.existsSync(tc.destinationPath)) {
            fs.mkdirSync(tc.destinationPath);
        }
        var childDirs = fs.readdirSync(tc.sourceTemplatePath);
        childDirs.forEach(childDir => {
            var childDirPath = path.join(tc.destinationPath, childDir);
            log(indentLevel, `.4. Child directory: '${childDirPath}'`);
            var destinationFolderPathResolve = this.resolveFileSystemToken(childDirPath, tc.tokens, tc.tokens);
            destinationFolderPathResolve.forEach(folderResolve => {
                var newTc: ITemplateConfig = { sourceTemplatePath: path.join(tc.sourceTemplatePath, childDir), destinationPath: folderResolve.data, tokens: tc.tokens };
                this.resolveFolder(newTc, folderResolve, indentLevel);
            });
        });
    }

    resolveFolder(tc: ITemplateConfig, folderResolve: IFileSystemTokenResolve, indentLevel: number = 1) {
        var destinationFolderPath = tc.destinationPath;
        log(indentLevel, `.4. Checking destination folder path '${destinationFolderPath}'...`);
        if (!fs.existsSync(destinationFolderPath)) {
            log(indentLevel, `.5. Creating folder '${destinationFolderPath}'`);
            fs.mkdirSync(destinationFolderPath);
        }
        else {
            log(indentLevel, `.5. Folder ${destinationFolderPath} already exists`);
        }
        log(indentLevel, `.6. Reading directory contents`);
        fs.readdirSync(tc.sourceTemplatePath).forEach(templateDir => {
            var templateDirPath = path.join(tc.sourceTemplatePath, templateDir);
            log(indentLevel, `.7. Checking if the path '${templateDirPath}' is a directory or a file`);
            if (fs.lstatSync(templateDirPath).isDirectory()) {
                log(indentLevel, `.8. Path '${templateDirPath}' is a directory`);
                var templateDirResolution = this.resolveFileSystemToken(templateDir, folderResolve.refConfig, tc.tokens);
                templateDirResolution.forEach(resolve => {
                    var newTc: ITemplateConfig = {
                        sourceTemplatePath: path.join(tc.sourceTemplatePath, templateDir),
                        destinationPath: path.join(destinationFolderPath, resolve.data),
                        tokens: tc.tokens
                    };
                    log(indentLevel, `.9. Processing the contents of directory`);
                    this.resolveFolder(newTc, resolve, indentLevel + 1);
                });
            }
            else {
                log(indentLevel, `.8. Path '${templateDirPath}' is a file`);
                var templateFilePath = path.join(tc.sourceTemplatePath, templateDir);
                var fileResolution = this.resolveFileSystemToken(templateDir, folderResolve.refConfig, tc.tokens);
                fileResolution.forEach(fileResolve => {
                    this.resolveFile(destinationFolderPath, templateFilePath, fileResolve, tc.tokens, indentLevel);
                });
            }
        });
    }

    resolveFile(destinationFolderPath: string, templateFilePath: string, fileResolve: IFileSystemTokenResolve, baseConfig: ITemplateTokenConfig, indentLevel: number = 1) {
        var destinationFilePath = path.join(destinationFolderPath, fileResolve.data);
        log(indentLevel, `.9. Formatting the contents of file ${templateFilePath}`);
        var templateFileContent = fs.readFileSync(templateFilePath).toString();
        var destinationFileContent = this.resolveFileContentTokens(templateFileContent, fileResolve.refConfig, baseConfig);
        log(indentLevel, `.10. Creating file '${destinationFilePath}'`);
        fs.writeFileSync(destinationFilePath, destinationFileContent);
    }

    resolveFileContentTokens(str: string, tokenConfig: ITemplateTokenConfig, baseConfig: ITemplateTokenConfig, parent?: ITemplateTokenInfo) {
        var _str = this._resolveFileContentTokens(str, tokenConfig, baseConfig, parent);
        if (_str.indexOf("[") > -1) {
            _str = this._resolveFileContentTokens(_str, tokenConfig, baseConfig);
        }
        if (_str.indexOf("[") > -1) {
            _str = this._resolveFileContentTokens(_str, tokenConfig, baseConfig);
        }
        if (_str.indexOf("[") > -1) {
            _str = this._resolveFileContentTokens(_str, tokenConfig, baseConfig);
        }
        if (_str.indexOf("[") > -1) {
            _str = this._resolveFileContentTokens(_str, baseConfig, baseConfig);
        }
        return _str;
    }

    _resolveFileContentTokens(str: string, tokenConfig: ITemplateTokenConfig, baseConfig: ITemplateTokenConfig, parent?: ITemplateTokenInfo) {
        var result = str;
        Object.getOwnPropertyNames(tokenConfig).forEach(p => {
            var _typeofOfP = typeof tokenConfig[p];
            if (_typeofOfP === "object" && Array.isArray(tokenConfig[p])) {
                var _beginFor = `[$for ${p}]`;
                var _beginForIndex = result.indexOf(_beginFor);
                var _endFor = `[^for ${p}]`;
                var _endForIndex = result.indexOf(_endFor);
                if (_beginForIndex > -1 && _endForIndex > -1) {
                    var _str = result.slice(_beginForIndex + _beginFor.length, _endForIndex);
                    var _result = "";
                    (<Array<ITemplateTokenConfig>>tokenConfig[p]).forEach(_data => {
                        _result += this.resolveFileContentTokens(_str, _data, baseConfig, { propName: p, propType: "array", parent: parent });
                    });
                    result = result.replace(result.slice(_beginForIndex, _endForIndex + _endFor.length), _result);
                }
            }
            else if (_typeofOfP === "object") {
                result = this.resolveFileContentTokens(result, <ITemplateTokenConfig>tokenConfig[p], baseConfig, { propName: p, propType: "object", parent: parent });
            }
            else if (["string", "number", "boolean"].indexOf(_typeofOfP) > -1) {
                result = result.split(`[${p}]`).join(`${tokenConfig[p]}`);
                var _parent = parent;
                var _key = p;
                while (_parent && _parent.propType !== "array") {
                    _key = `${_parent.propName}.${_key}`;
                    result = result.split(`[${_key}]`).join(<string>tokenConfig[p]);
                    _parent = _parent.parent;
                }
            }
            else {
                throw `Unable to resolve token '${str}': Type '${_typeofOfP}' is not supported.`;
            }
        });
        return result;
    }

    resolveFileSystemToken(tokenStr: string, configContext: ITemplateTokenConfig, baseConfigContext: ITemplateTokenConfig): Array<IFileSystemTokenResolve> {
        if (configContext !== undefined && configContext !== null) {
            while (tokenStr.indexOf("[") > -1) {
                var beginTokenIndex = tokenStr.indexOf("[");
                var endTokenIndex = tokenStr.indexOf("]");
                var innerToken = tokenStr.slice(beginTokenIndex + 1, endTokenIndex);
                while (innerToken.indexOf("[") > -1) {
                    beginTokenIndex = innerToken.indexOf("[");
                    innerToken = innerToken.slice(beginTokenIndex + 1, endTokenIndex);
                }
                let result: Array<IFileSystemTokenResolve> = [];
                let innerTokenResolve = this.resolveFileSystemTokenByParts(innerToken.split("."), innerToken, configContext, baseConfigContext);
                if (innerTokenResolve) {
                    innerTokenResolve.forEach(resolve => {
                        let _resolve = tokenStr.split(`[${innerToken}]`).join(resolve.data);
                        let _result = this.resolveFileSystemToken(_resolve, resolve.refConfig, baseConfigContext);
                        result.push(..._result);
                    });
                    return result;
                }
            }
        }
        return [{ data: tokenStr, refConfig: configContext }];
    }
    
    resolveFileSystemTokenByParts(tokenParts: Array<string>, tokenStr: string, configContext: ITemplateTokenConfig, baseConfigContext: ITemplateTokenConfig): Array<IFileSystemTokenResolve> {
        if (tokenParts.length > 2)
            throw `Error in folder naming '${tokenStr}': Dot notation can only go upto 2 levels`;

        var tokenPart = tokenParts[0];
        var subTokenPart = tokenParts[1];
        var result = [];

        if (!tokenPart)
            throw `Error in folder naming '${tokenStr}': Invalid token`;

        if (subTokenPart) {
            if (typeof configContext[tokenPart] !== "object")
                throw `Error in folder naming '${tokenStr}': Expecting the first part '${tokenPart}' to be an array`;
            if (!Array.isArray(configContext[tokenPart]))
                throw `Error in folder naming '${tokenStr}': Expecting the first part '${tokenPart}' to be an array`;

            (<Array<ITemplateTokenConfig>>configContext[tokenPart]).forEach(subConfig => {
                var subConfigValue = subConfig[subTokenPart];
                if (typeof subConfigValue !== "string")
                    throw `Error in folder naming '${tokenStr}': The token doesnot resolve to a string`;
                subConfigValue = this.resolveFileContentTokens(subConfigValue, subConfig, baseConfigContext);
                result.push({ data: subConfigValue, refConfig: subConfig });
            });
        }
        else {
            let configValue = configContext[tokenPart];
            if (typeof configValue === "string") {
                configValue = this.resolveFileContentTokens(configValue, configContext, baseConfigContext);
                result.push({ data: configValue, refConfig: configContext });
            }
            else if (typeof configValue === "undefined") {
                configValue = this.resolveFileContentTokens(`[${tokenPart}]`, baseConfigContext, baseConfigContext);
                result.push({ data: configValue, refConfig: configContext });
            }
            else {
                throw `Error in folder naming '${tokenStr}': Expecting the expression to be of type string`;
            }
        }
        return result;
    }
    
    getTemplateConfig(templateConfigPath: string): ITemplateConfig {
        if (!fs.existsSync(templateConfigPath)) throw `Unable to find configuration file '${templateConfigPath}'`;
        templateConfigPath = path.normalize(templateConfigPath);
        var templateConfig = require(templateConfigPath);
        var templateFolderPath = path.dirname(templateConfigPath);
        if (!path.isAbsolute(templateConfig.destinationPath)) {
            templateConfig.destinationPath = path.join(templateFolderPath, templateConfig.destinationPath);
        }
        if (!path.isAbsolute(templateConfig.sourceTemplatePath)) {
            templateConfig.sourceTemplatePath = path.join(templateFolderPath, templateConfig.sourceTemplatePath);
        }
        return require(templateConfigPath);
    }
}

export const builder = new Builder();