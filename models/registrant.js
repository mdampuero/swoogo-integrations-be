const { Schema, model } = require('mongoose');

const RegistrantSchema = Schema({
    swoogo_id: {
        type: Number
    },
    swoogo_event_id: {
        type: Number
    },
    swoogo_data:{
        type: Schema.Types.Mixed
    },
    transaction: {
        type: Schema.Types.ObjectId,
        ref: 'Transaction',
        required: [true, 'The integration is required']
    },
    email:{
        type: String 
    },
    price:{
        type: Number 
    }
})

module.exports = model('Registrant', RegistrantSchema);