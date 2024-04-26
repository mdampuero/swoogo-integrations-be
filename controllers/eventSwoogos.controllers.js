const { response, request } = require("express");
const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");

const eventSwoogoGet = async (req = request, res = response) => {

    try {
        const instance = axios.create({
            baseURL: `${process.env.SWOOGO_APIURL}event.json`,
            params: { fields : "*", "per-page": 100 },
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

const demosGetOne = async (req, res = response) => {
    const { id } = req.params;
    const demo = await Demo.findById(id);
    res.json({
        demo
    })
}

const eventSwoogoSession = async (req = request, res = response) => {

    try {
        const { id } = req.params;
        const instance = axios.create({
            baseURL: `${process.env.SWOOGO_APIURL}sessions.json?event_id=${id}`,
            params: { fields : "*", "per-page": 100 },
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

const eventSwoogoSessionPost = async (req = request, res = response) => {

    try {
        const { sessionId, registrantId } = req.body;
        const instance = axios.create({
            baseURL: `${process.env.SWOOGO_APIURL}registrants/${registrantId}.json?fields=id&expand=`,
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        const resp = await instance.get();

        const respPost = await axios.post(`${process.env.SWOOGO_APIURL}scans/registrant/${registrantId}/session/${sessionId}.json`, null, {
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        res.json({
            registrant: resp.data,
            result: respPost.data
        });


    } catch (error) {
        res.status((typeof error.status != "undefined") ? error.status : 500).json({
            "result": false,
            "data": error
        })
    }
}


module.exports = {
    eventSwoogoGet,
    eventSwoogoSession,
    eventSwoogoSessionPost
}