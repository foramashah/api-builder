export interface ITemplateTokenInfo {
    propName?: string;
    propType?: "array" | "object";
    parent?: ITemplateTokenInfo;
}

export interface ITemplateConfig {
    sourceTemplatePath: string;
    destinationPath: string;
    tokens: ITemplateTokenConfig;
}

export interface ITemplateTokenConfig {
    [key: string]: ITemplateTokenConfig | ITemplateTokenConfig[] | string | number | boolean;
}

export interface IFileSystemTokenResolve {
    data: string;
    refConfig: ITemplateTokenConfig;
}