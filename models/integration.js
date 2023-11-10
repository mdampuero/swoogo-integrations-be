const { Schema, model } = require('mongoose');

const IntegrationSchema = Schema({
    type: {
        type: String,
        required: [true]
    },
    event:{
        type: Schema.Types.Mixed,
        ref: 'Event'
    },
    access_token: {
        type: String
    },
    event_id: {
        type: String
    },
    item_title: {
        type: String
    },
    item_currency: {
        type: String
    },
    item_price: {
        type: String
    },
    description: {
        type: String
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    transactions: [{ 
        type: Schema.ObjectId, 
        ref: 'Transaction' 
    }]
})

IntegrationSchema.methods.toJSON = function () {
    const { __v, _id,... integration} = this.toObject();
    integration.id=_id
    return integration;
}

module.exports = model('Integration', IntegrationSchema);