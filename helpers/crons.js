const Event = require("../models/event");

const disableEvent = async () => {
    console.log("Running cron");
    const currentDate = new Date();
    const [results] = await Promise.all([
        Event.find({ isDelete: false, isActive: true,  end_date: { $lte: currentDate }})
    ])
    results.forEach(result => {
        result.isActive = false;
        result.save();
    });
}

module.exports = {
    disableEvent
}