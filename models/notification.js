const { Schema, model } = require('mongoose');

const NotificationSchema = Schema({
    name: {
        type: String,
        required: [true, 'The name is required']
    },
    type: {
        type: String,
        required: [true, 'The type is required']
    },
    payload:{
        type: Schema.Types.Mixed
    },
    response:{
        type: Schema.Types.Mixed
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    isDelete: {
        type: Boolean,
        default: false
    }
})

NotificationSchema.methods.toJSON = function () {
    const { __v, _id,... notification} = this.toObject();
    notification.id=_id
    return notification;
}

module.exports = model('Notification', NotificationSchema);