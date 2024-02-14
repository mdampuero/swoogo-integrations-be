const { response, request } = require("express");
const PublicUser = require("../models/publicUser");
const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");

const getAll = async (req = request, res = response) => {
    const { 'per-page': perPage, page } = req.query;
    const integration = req.integration;
    const instance = axios.create({
        baseURL: `${process.env.SWOOGO_APIURL}registrants.json`,
        params: { 
            fields: "id,first_name,last_name,email,mobile_phone,job_title,company,registration_status", 
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
        items: items
    });
}

const post = async (req, res = response) => {
    const body = req.body;
    const formData = convertJson2Form(body);
    formData.append('event_id', req.integration.event_id);
    try {
        const resp = await axios.post(`${process.env.SWOOGO_APIURL}registrants/create.json`, formData, {
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        const { first_name, last_name, email, id, mobile_phone, job_title, company, registration_status } = resp.data
        res.json({
            data: {
                id, first_name, last_name, email, mobile_phone, job_title, company, registration_status
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

const getOne = async (req, res = response) => {
    const { registrantId } = req.params;
    const body = req.body;
    const formData = convertJson2Form(body);
    formData.append('event_id', req.integration.event_id);
    try {
        const resp = await axios.get(`${process.env.SWOOGO_APIURL}registrants/${registrantId}.json`, {
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        const { first_name, last_name, email, id, mobile_phone, job_title, company, registration_status } = resp.data
        res.json({
            data: {
                id, first_name, last_name, email, mobile_phone, job_title, company, registration_status
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
        const { first_name, last_name, email, id, mobile_phone, job_title, company, registration_status } = resp.data
        res.json({
            data: {
                id, first_name, last_name, email, mobile_phone, job_title, company, registration_status
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
    const formData = new FormData();
    formData.append('registration_status', 'cancelled');
    try {
        const resp = await axios.put(`${process.env.SWOOGO_APIURL}registrants/update/${registrantId}.json`, formData, {
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        const { first_name, last_name, email, id, mobile_phone, job_title, company, registration_status } = resp.data
        res.json({
            data: {
                id, first_name, last_name, email, mobile_phone, job_title, company, registration_status
            }
        })
    } catch (error) {
        console.log(error);
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
    put,
    getOne,
    remove
}