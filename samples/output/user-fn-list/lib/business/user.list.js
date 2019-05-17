const { dal, mapper } = require("../dependency.js").list();

/**
 * @param {import("../model/@types/user.dto").DTO.User} user
 */
module.exports = async (user) => {
    var userBO = mapper.dto2bo(user);
    var result = await dal.insert(userBO);
    return result;
};