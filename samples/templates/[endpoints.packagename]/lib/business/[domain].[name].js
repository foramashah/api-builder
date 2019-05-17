const { dal, mapper } = require("../dependency.js").[name]();

/**
 * @param {import("../model/@types/[domain].dto").DTO.[Domain]} [domain]
 */
module.exports = async ([domain]) => {
    var [domain]BO = mapper.dto2bo([domain]);
    var result = await dal.[dbmethod]([domain]BO);
    return result;
};