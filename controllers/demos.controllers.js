const { response, request } = require("express");
const Demo = require("../models/demo");
const { demoQuery } = require('../helpers/demo');
const { calcPage } = require('../helpers/utils');

const demosGet = async (req = request, res = response) => {
    const schema = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.NODE_ENV === 'production' ? process.env.DOMAIN : 'localhost';
    const port = process.env.NODE_ENV === 'production' ? '' : ':' + process.env.PORT;

    res.json({
        schema,
        host,
        port
    })
    // const { limit, sort, direction, offset, query } = demoQuery(req);
    // const [total, result] = await Promise.all([
    //     Demo.countDocuments(query),
    //     Demo.find(query)
    //         .sort([[sort, direction]])
    //         .limit(limit)
    //         .skip(offset)
    // ])
    // res.json({
    //     total,
    //     pages: calcPage(total, limit),
    //     limit,
    //     data: result
    // })
}

const demosGetOne = async (req, res = response) => {
    const { id } = req.params;
    const demo = await Demo.findById(id);
    res.json({
        demo
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
    demosGetOne
}