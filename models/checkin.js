const { Schema, model } = require('mongoose');

const CheckinSchema = Schema({
    id: {
        required: [true, 'The id is required'],
        type: Number
    },
    document:{
        required: [true, 'The document is required'],
        type: String
    },
    integration: {
        type: Schema.Types.ObjectId,
        ref: 'Integration',
        required: [true, 'The integration is required']
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    request_label:{
        type: String
    },
    request_value:{
        type: String
    },
    firstName:{
        type: String
    },
    lastName:{
        type: String
    },
    email:{
        type: String
    },
    phone:{
        type: String
    }
})

module.exports = model('Checkin', CheckinSchema);