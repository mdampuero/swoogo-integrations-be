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

const isActive = async (req = request, res, next) => {
    const { end_date } = req.body;
    const dateToCheck = new Date(end_date);
    const currentDate = new Date();
    if (dateToCheck < currentDate) {
        req.body.isActive = false 
    } else {
        req.body.isActive = true
    }
    next();
}

module.exports = {
    isUniqueName,
    isEventExist,
    isActive
}