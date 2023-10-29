
const transaction = require("../models/transaction");

const existTransaction = async (id) => {
    const exist = await transaction.findById(id);
    if (!exist) {
        throw new Error('This entity "' + id + '" is not exist');
    }
}

module.exports = {
    existTransaction
}