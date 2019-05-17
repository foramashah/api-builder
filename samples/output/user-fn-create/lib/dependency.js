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

module.exports.create = function () {
    return {
        dal: require("./dal/user.dal.js"),
        mapper: {
            bo2dto: require("./model/mapper/bo2dto.js"),
            dto2bo: require("./model/mapper/dto2bo.js")
        }
    };
}