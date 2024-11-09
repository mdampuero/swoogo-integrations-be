const { response, request } = require("express");
const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");
const { parseErrorSwoogo, convertJson2Form, deconstructAnswer } = require("../helpers/utils");

const mapper = {
    "id"          : "id",
    "event_id"    : "event_id",
    "first_name"  : "first_name",
    "last_name"   : "last_name",
    "email"       : "email",
    "rut"         : "c_4392417",
    "mobile_phone": "mobile_phone",
}

const registrantGet = async (req = request, res = response) => {

    try {
        const { event_id } = req.query;
        const instance = axios.create({
            baseURL: `${process.env.SWOOGO_APIURL}registrants.json?event_id=${ event_id }&fields=first_name,last_name,id,email,group_id,mobile_phone`,
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

const registrantPost = async (req, res = response) => {
    const body = req.body;
    const formData = convertJson2Form(body, mapper);
    try {
        const resp = await axios.post(`${process.env.SWOOGO_APIURL}registrants/create.json`, formData, {
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        res.json({ data: deconstructAnswer(resp.data, mapper) });
    } catch (error) {
        if (error.response) {
            const { errorMessage, statusCode } = parseErrorSwoogo(error);
            res.status(statusCode).json({
                "msg": errorMessage
            });
        } else {
            res.status(500).json({
                "msg": "Error interno del servidor."
            });
        }
    }
}

module.exports = {
    registrantGet,
    registrantPost
}