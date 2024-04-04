const { Schema, model } = require('mongoose');

const SettingSchema = Schema({
    max_slider_home: {
        type: Number,
        default: 10
    },
    max_slider_similar: {
        type: Number,
        default: 10
    },
    max_slider_categories: {
        type: Number,
        default: 10
    },
    max_slider_last: {
        type: Number,
        default: 10
    },
    banner: {
        type: String,
    },
    banner_link: {
        type: String,
    },
})

module.exports = model('Setting', SettingSchema);