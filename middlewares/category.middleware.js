const Category = require("../models/category");

const isUniqueName = async (name) => {
    const exist = await Category.findOne({ name, isDelete: false });
    if (exist) {
        throw new Error('This name ' + name + ' already exist');
    }
}

const isCategoryExist = async (id) => {
    const exist = await Category.findById(id);
    if (!exist) {
        throw new Error('This entity "' + id + '" is not exist');
    }
}

module.exports = {
    isUniqueName,
    isCategoryExist
}