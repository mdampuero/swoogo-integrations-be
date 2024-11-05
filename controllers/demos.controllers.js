const { response, request } = require("express");
const Demo = require("../models/demo");
const Transaction = require("../models/transaction");
const { demoQuery } = require('../helpers/demo');
const { calcPage, logger } = require('../helpers/utils');
const axios = require('axios');

const { authentication } = require("../helpers/swoogo-auth");
const FormData = require('form-data');

const demosGet = async (req = request, res = response) => {


    // const schema = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    // const host = process.env.NODE_ENV === 'production' ? process.env.DOMAIN : 'localhost';
    // const port = process.env.NODE_ENV === 'production' ? '' : ':' + process.env.PORT;

    // res.json({
    //     schema,
    //     host,
    //     port
    // })
    const { limit, sort, direction, offset, query } = demoQuery(req);
    const [total, result] = await Promise.all([
        Demo.countDocuments(query),
        Demo.find(query)
            .sort([[sort, direction]])
            .limit(limit)
            .skip(offset)
    ])
    logger.info(result);
    res.json({
        total,
        pages: calcPage(total, limit),
        limit,
        data: result
    })
}

const demosGetOne = async (req, res = response) => {
    const { id } = req.params;
    const demo = await Demo.findById(id);
    res.json({
        demo
    })
}

const simulPay = async (req, res = response) => {
    const { transaction_id } = req.body;
    let transaction = await Transaction.findById(transaction_id).populate({
        path: "registrants",
        model: "Registrant"
    });

    transaction.status = "approved";
    transaction.amount = "123";
    transaction.registrants.forEach(async registrant => {
        /** Update data in Swoogo */
        const formData = new FormData();
        formData.append('c_3473417', '17536652');
        const resp = await axios.put(`${process.env.SWOOGO_APIURL}registrants/update/${registrant.swoogo_id}.json`, formData, {
            headers: { "Authorization": "Bearer " + await authentication() }
        });
    });
    await Promise.all([
        transaction.save()
    ]);

    req.io.emit("message", {
        "transaction_id": transaction_id,
        "status": "approved",
        "action": "themify.58ecddba064e63f7"
    });
    res.json({
        "result": "ok"
    })
}

const demosPost = async (req, res = response) => {
    const { name, description } = req.body;
    const demo = new Demo({ name, description });
    await demo.save();
    res.json({
        demo
    })
}

const demosPut = async (req, res = response) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const demo = await Demo.findByIdAndUpdate(id, { name, description }, { new: true });
    res.json({
        demo
    })
}

const demosDelete = async (req, res = response) => {
    const { id } = req.params;
    const demo = await Demo.findByIdAndUpdate(id, { isDelete: true }, { new: true });
    res.json({
        demo
    })
}

module.exports = {
    demosGet,
    demosPost,
    demosPut,
    demosDelete,
    demosGetOne,
    simulPay
}