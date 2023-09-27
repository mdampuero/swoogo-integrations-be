const { Schema, model } = require('mongoose');

const TransactionSchema = Schema({
    created_at: {
        type: Date,
        default: new Date()
    },
    integration: {
        type: Schema.Types.ObjectId,
        ref: 'Integration',
        required: [true, 'The integration is required']
    },
    status: {
        type: String
    },
    amount: {
        type: String
    },
    response:{
        type: Schema.Types.Mixed
    },
})

TransactionSchema.methods.toJSON = function () {
    const { __v, _id, ...transaction } = this.toObject();
    transaction.id = _id
    return transaction;
}

module.exports = model('Transaction', TransactionSchema);