const { Schema, model } = require('mongoose');

const EventSchema = Schema({
    name: {
        type: String,
        required: [true, 'The name is required']
    },
    duration: {
        type: String,
    },
    pictureBackground: {
        type: String,
    },
    pictureCard: {
        type: String,
    },
    description: {
        type: String
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    category_id: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    inHome: {
        type: Boolean,
        default: false
    },
    inSwoogo: {
        type: Boolean,
        default: false
    },
    start_date: {
        type: Date
    },
    start_time: {
        type: String,
        default: "00:00"
    },
    end_date: {
        type: Date
    },
    end_time: {
        type: String,
        default: "00:00"
    },
    url: {
        type: String,
    },
    order: {
        type: Number,
    },
    eventSwoogo: {
        type: String
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    lat: {
        type: Number,
    },
    lng: {
        type: Number,
    },
    zoom: {
        type: Number,
    },
})

EventSchema.methods.toJSON = function () {
    const { __v, _id, ...event } = this.toObject();
    event.id = _id;
    return event;
}

module.exports = model('Event', EventSchema);