const { response, request } = require("express");
const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");

const eventGet = async (req = request, res = response) => {

    try {
        const instance = axios.create({
            baseURL: `${process.env.SWOOGO_APIURL}events.json`,
            headers: { "Authorization": "Bearer "+ await authentication() }
        });
        const resp = await instance.get();
        const { items, _meta } = resp.data;
        res.json({
            total: _meta.totalCount,
            pages: _meta.pageCount,
            limit: _meta.perPage,
            data: items
        });
    } catch (error) {
        res.status((typeof error.status != "undefined") ? error.status : 500).json({
            "result": false,
            "data": error
        })
    }
}

module.exports = {
    eventGet
}