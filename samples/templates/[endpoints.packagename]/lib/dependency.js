module.exports.mongoWrapper = function () {
    return {
        mongodb: require("mongodb")
    };
}

module.exports.dal = function () {
    return {
        mongoWrapper: require("./mongodb-wrapper.js")
    };
}

module.exports.[name] = function () {
    return {
        dal: require("./dal/[domain].dal.js"),
        mapper: {
            bo2dto: require("./model/mapper/bo2dto.js"),
            dto2bo: require("./model/mapper/dto2bo.js")
        }
    };
}