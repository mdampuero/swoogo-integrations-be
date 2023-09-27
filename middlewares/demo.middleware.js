const Demo = require("../models/demo");

const isUniqueName = async (name) => {
    const exist = await Demo.findOne({ name, isDelete: false });
    if (exist) {
        throw new Error('This name ' + name + ' already exist');
    }
}

const isDemoExist = async (id) => {
    const exist = await Demo.findById(id);
    if (!exist) {
        throw new Error('This entity "' + id + '" is not exist');
    }
}


module.exports = {
    isUniqueName,
    isDemoExist
}