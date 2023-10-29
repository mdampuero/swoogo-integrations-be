const { response, request } = require("express");
const Integration = require("../models/integration");
const Transaction = require("../models/transaction");
const { integrationQuery } = require('../helpers/integration');
const { calcPage } = require('../helpers/utils');

const integrationsGet = async (req = request, res = response) => {
    const { limit, sort, direction, offset, query } = integrationQuery(req);
    const [total, result] = await Promise.all([
        Integration.countDocuments(query),
        Integration.find(query)
            .sort([[sort, direction]])
            .limit(limit)
            .skip(offset)
    ])
    res.json({
        total,
        pages: calcPage(total, limit),
        limit,
        data: result
    })
}

const integrationsTransactions = async (req, res = response) => {
    const { id } = req.params;
    const transactions = await Transaction.find({ integration: id, status: { $ne: 'empty' } }).populate({
        path: "registrants",
        model: "Registrant"
    });
    res.json({
        data: transactions
    })
}

const integrationsGetOne = async (req, res = response) => {
    const { id } = req.params;
    const integration = await Integration.findById(id)
    // .populate({
    //     path : "transactions",
    //     model : "Transaction",
    //     pupulate: {
    //         path: "registrants",
    //         model: "Registrant",
    //         select: "email"
    //     }
    // })

    res.json({
        integration
    })
}

const integrationsStats = async (req, res = response) => {
    res.json({
        total: await Integration.countDocuments({ isDelete: false })
    })
}

const integrationsPost = async (req, res = response) => {
    const { id, ...body } = req.body;
    const integration = new Integration(body);
    await integration.save();
    res.json({
        integration
    })
}

const integrationsPut = async (req, res = response) => {
    const { id } = req.params;
    const integration = await Integration.findByIdAndUpdate(id, req.body, { new: true });
    res.json({
        integration
    })
}

const integrationsDelete = async (req, res = response) => {
    const { id } = req.params;
    const integration = await Integration.findByIdAndUpdate(id, { isDelete: true }, { new: true });
    res.json({
        integration
    })
}

module.exports = {
    integrationsGet,
    integrationsPost,
    integrationsPut,
    integrationsDelete,
    integrationsGetOne,
    integrationsStats,
    integrationsTransactions
}