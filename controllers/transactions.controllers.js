const { response, request } = require("express");
const Transaction = require("../models/transaction");
const { transactionQuery } = require("../helpers/transaction");
const { calcPage } = require('../helpers/utils');
const integration = require("../models/integration");

const transactionStats = async (req, res = response) => {
    res.json({
        total: await Transaction.countDocuments()
    })
}

const transactionCheck = async (req, res = response) => {
    try {
        const { transaction_id } = req.body;
        const transaction = await Transaction.findById(transaction_id);
        if(!transaction){
            res.json({
                "result": false,
                "data": ""
            });
        }
        switch (transaction.status){
            case "approved":
                res.json({
                    "result": true,
                    "data": transaction
                });
                break;

            default:
                res.json({
                    "result": false,
                    "data": ""
                });
        }

    } catch (error) {
        res.json({
            "result": false,
            "data": ""
        });
    }
}

const transactionGet = async (req = request, res = response) => {
    const { limit, sort, direction, offset, query } = transactionQuery(req);
    const [total, result] = await Promise.all([
        Transaction.countDocuments(query),
        Transaction.find(query)
            .sort([[sort, direction]])
            .limit(limit)
            .skip(offset)
            .populate({
                path: "registrants",
                model: "Registrant"
            })
    ])
    res.json({
        total,
        pages: calcPage(total, limit),
        limit,
        data: result
    })
}

module.exports = {
    transactionStats,
    transactionCheck,
    transactionGet
}