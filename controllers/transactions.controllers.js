const { response, request } = require("express");
const Transaction = require("../models/transaction");


const transactionStats = async (req, res = response) => {
    res.json({
        total: await Transaction.countDocuments()
    })
}


module.exports = {
    transactionStats
}