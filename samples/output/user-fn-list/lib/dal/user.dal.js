const { mongoWrapper } = require("../dependency.js").dal();

/**
 * @param {import("../model/@types/user.bo")} user
 */
module.exports.insert = async function insert(user) {
    return (await mongoWrapper.connect("mongodb://localhost:27017", "userdb"))
    .insert("User", user);
}