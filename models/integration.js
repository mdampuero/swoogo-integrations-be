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
    event_id: {
        type: String
    },
    access_token: {
        type: String
    },
    access_code: {
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
    camaraEnabled: {
        type: Boolean,
        default: true
    },
    textAction: {
        type: String
    },
    extraOption: {
        type: Boolean,
        default: false
    },
    request: {
        type: Boolean,
        default: false
    },
    request_label: {
        type: String
    },
    request_field: {
        type: String
    },
    request_input_type: {
        type: String
    },
    request_options: {
        type: [String]
    },
    print: {
        type: Boolean,
        default: false
    },
    print_fields: {
        type: []
    },
    email_enabled: {
        type: Boolean,
        default: false
    },
    email_type: {
        type: String
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    pictureBackground: {
        type: String,
    },
    pictureAction: {
        type: String,
    },
    pictureFooter: {
        type: String,
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