const { response, request } = require("express");
const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");
const { parseErrorSwoogo, convertJson2Form, getString, deconstructAnswer, getAllFields } = require("../helpers/utils");

const mapper = {
    "id"                 : "id",
    "first_name"         : "first_name",
    "last_name"          : "last_name",
    "email"              : "email",
    "mobile_phone"       : "mobile_phone",
    "job"                : "job_title",
    "company"            : "company",
    "registration_status": "registration_status",
    "external_id"        : "c_3803254",
    "assistant_type"     : "c_3803393",
    "country"            : "c_3803253",
    "company_description": "c_3803255",
    "company_logo"       : "c_3803395",
    "company_web"        : "c_3803396"
}

const getAll = async (req = request, res = response) => {
    const { 'per-page': perPage, page } = req.query;
    const integration = req.integration;
    const instance = axios.create({
        baseURL: `${process.env.SWOOGO_APIURL}registrants.json`,
        params: {
            fields: getString(mapper),
            'per-page': perPage,
            page,
            event_id: integration.event_id,
            search: "registration_status=confirmed"
        },
        headers: { "Authorization": "Bearer " + await authentication() }
    });
    const resp = await instance.get();
    const { items, _meta } = resp.data;

    res.json({
        total: _meta.totalCount,
        pages: _meta.pageCount,
        limit: _meta.perPage,
        items: getAllFields(items, mapper)
    });
}

const post = async (req, res = response) => {
    const body = req.body;
    const formData = convertJson2Form(body, mapper);
    formData.append('event_id', req.integration.event_id);
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

const getOne = async (req, res = response) => {
    const { registrantId } = req.params;
    const body = req.body;
    const formData = convertJson2Form(body, mapper);
    formData.append('event_id', req.integration.event_id);
    try {
        const resp = await axios.get(`${process.env.SWOOGO_APIURL}registrants/${registrantId}.json`, {
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

const put = async (req, res = response) => {
    const { registrantId } = req.params;
    const body = req.body;
    const formData = convertJson2Form(body, mapper);
    formData.append('event_id', req.integration.event_id);
    try {
        const resp = await axios.put(`${process.env.SWOOGO_APIURL}registrants/update/${registrantId}.json`, formData, {
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

const remove = async (req, res = response) => {
    const { registrantId } = req.params;
    const formData = new FormData();
    formData.append('registration_status', 'cancelled');
    try {
        const resp = await axios.put(`${process.env.SWOOGO_APIURL}registrants/update/${registrantId}.json`, formData, {
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
    getAll,
    post,
    put,
    getOne,
    remove
}