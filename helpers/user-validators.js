const Role = require("../models/role");
const User = require("../models/user");


const isRoleValid = async (role) => {
    const existRole = await Role.findOne({ role });
    if (!existRole) {
        throw new Error('This role ' + role + ' is not valid');
    }
}

const isEmailExist = async (email) => {
    const existUser = await User.findOne({ email });
    if (existUser) {
        throw new Error('This email ' + email + ' already exist');
    }
}



const isUserExist = async (id) => {
    const existUser = await User.findOne({ _id: id });
    if (!existUser) {
        throw new Error('This user "' + id + '" is not exist');
    }
}

module.exports = {
    isRoleValid,
    isEmailExist,
    isUserExist
}