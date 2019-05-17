const { mongoWrapper } = require("../dependency.js").dal();

/**
 * @param {import("../model/@types/[domain].bo")} [domain]
 */
module.exports.[dbmethod] = async function [dbmethod]([domain]) {
    return (await mongoWrapper.connect("mongodb://localhost:27017", "[dbname]"))
    .[dbmethod]("[Domain]", [domain]);
}