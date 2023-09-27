const { Schema, model } = require('mongoose');

const EventSchema = Schema({
    id: {
        type: Number,
    },
    name: {
        type: String,
    }
})

module.exports = model('Event', EventSchema);