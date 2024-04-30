const { response, request } = require("express");
const Integration = require("../models/integration");
const Transaction = require("../models/transaction");
const { integrationQuery } = require('../helpers/integration');
const { calcPage } = require('../helpers/utils');
const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");

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
    try {
        const { id } = req.params;
        const integration = await Integration.findOne({ _id:id, isActive: true })
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
    } catch (error) {
        res.status((typeof error.status != "undefined") ? error.status : 500).json({
            "result": false,
            "data": error
        })
    }
}

const integrationsGetSession = async (req, res = response) => {
    try {
        const { id, sessionId } = req.params;
        const integration = await Integration.findById(id)
        const instance = axios.create({
            baseURL: `${process.env.SWOOGO_APIURL}sessions/${sessionId}.json?fields=*&expand=`,
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        const resp = await instance.get();
        res.json({
            integration,
            session: resp.data
        })
    } catch (error) {
        res.status((typeof error.status != "undefined") ? error.status : 500).json({
            "result": false,
            "data": error
        })
    }
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
    integrationsTransactions,
    integrationsGetSession
}