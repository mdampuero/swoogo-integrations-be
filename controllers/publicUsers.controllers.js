const { response, request } = require("express");
const PublicUser = require("../models/publicUser");
const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");

const getAll = async (req = request, res = response) => {
    const { 'per-page': perPage, page } = req.query;
    const integration = req.integration;
    const instance = axios.create({
        baseURL: `${process.env.SWOOGO_APIURL}registrants.json`,
        params: { fields: "id, first_name, last_name , email, mobile_phone", 'per-page': perPage, page, event_id: integration.event_id },
        headers: { "Authorization": "Bearer " + await authentication() }
    });
    const resp = await instance.get();
    const { items, _meta } = resp.data;
    res.json({
        total: _meta.totalCount,
        pages: _meta.pageCount,
        limit: _meta.perPage,
        items: items
    });
}

const post = async (req, res = response) => {
    const body = req.body;
    const formData = convertJson2Form(body);
    formData.append('event_id', req.integration.event_id);
    try {
        console.log(formData)
        const resp = await axios.post(`${process.env.SWOOGO_APIURL}registrants/create.json`, formData, {
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        const { first_name, last_name, email, id, mobile_phone } = resp.data
        res.json({
            data: {
                id, first_name, last_name, email, mobile_phone
            }
        })
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
    const formData = convertJson2Form(body);
    formData.append('event_id', req.integration.event_id);
    try {
        const resp = await axios.put(`${process.env.SWOOGO_APIURL}registrants/update/${registrantId}.json`, formData, {
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        const { first_name, last_name, email, id, mobile_phone } = resp.data
        res.json({
            data: {
                id, first_name, last_name, email, mobile_phone
            }
        })
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
    const body = req.body;
    const formData = convertJson2Form(body);
    formData.append('event_id', req.integration.event_id);
    try {
        const resp = await axios.delete(`${process.env.SWOOGO_APIURL}registrants/update/${registrantId}.json`, formData, {
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        const { first_name, last_name, email, id, mobile_phone } = resp.data
        res.json({
            data: {
                id, first_name, last_name, email, mobile_phone
            }
        })
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

const convertJson2Form = (body) => {
    const formData = new FormData();
    for (const key in body) {
        if (Object.hasOwnProperty.call(body, key)) {
            const value = body[key];
            if (typeof value === 'object' && value !== null) {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value);
            }
        }
    }
    return formData
}

const parseErrorSwoogo = (error) => {
    let errorMessage = error.response.data.message;
    const statusCode = error.response.status;
    if (statusCode == 422) {
        errorMessage = error.response.data[0].message
    }
    return { errorMessage, statusCode }
}

module.exports = {
    getAll,
    post,
    put
}