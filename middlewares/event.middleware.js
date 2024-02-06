const Event = require("../models/event");

const isUniqueName = async (name) => {
    const exist = await Event.findOne({ name, isDelete: false });
    if (exist) {
        throw new Error('This name ' + name + ' already exist');
    }
}

const isEventExist = async (id) => {
    const exist = await Event.findById(id);
    if (!exist) {
        throw new Error('This entity "' + id + '" is not exist');
    }
}


module.exports = {
    isUniqueName,
    isEventExist
}