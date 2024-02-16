const { response, request } = require("express");
const PublicUser = require("../models/publicUser");
const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");

const mapper = {
    "external_id": "c_3803254",
    "assistant_type": "c_3803393",
    "country": "c_3803253",
    "company_description": "c_3803255",
    "company_logo": "c_3803395",
    "company_web": "c_3803396"
}

const getAll = async (req = request, res = response) => {
    const { 'per-page': perPage, page } = req.query;
    const integration = req.integration;
    const instance = axios.create({
        baseURL: `${process.env.SWOOGO_APIURL}registrants.json`,
        params: {
            fields: `id,first_name,last_name,email,mobile_phone,job_title,company,registration_status,${mapper.external_id},${mapper.assistant_type},${mapper.country},${mapper.company_description},${mapper.company_logo},${mapper.company_web}`,
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
        res.json({ data: deconstructAnswer(resp.data) });
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
        res.json({ data: deconstructAnswer(resp.data) });
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
        res.json({ data: deconstructAnswer(resp.data) });
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
        res.json({ data: deconstructAnswer(resp.data) });
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

const deconstructAnswer = (answer) => {
    return {
        first_name         : answer.first_name,
        last_name          : answer.last_name,
        email              : answer.email,
        id                 : answer.id,
        mobile_phone       : answer.mobile_phone,
        job                : answer.job_title,
        company            : answer.company,
        registration_status: answer.registration_status,
        external_id        : getValueOrNull(answer[mapper.external_id]),
        assistant_type     : getValueOrNull(answer[mapper.assistant_type]),
        country            : getValueOrNull(answer[mapper.country]),
        company_description: getValueOrNull(answer[mapper.company_description]),
        company_logo       : getValueOrNull(answer[mapper.company_logo]),
        company_web        : getValueOrNull(answer[mapper.company_web])
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
                if (val = getValueByKey(key)) {
                    formData.append(val, value);
                } else {
                    formData.append(key, value);
                }
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

const getKeyByValue = (value) => {
    for (let key in mapper) {
        if (mapper.hasOwnProperty(key)) {
            if (mapper[key] === value) {
                return key;
            }
        }
    }
    return null;
}

const getValueByKey = (key) => {
    return mapper.hasOwnProperty(key) ? mapper[key] : null;
}

const getValueOrNull = (value) => {
    return (value) ? value : ""
}

module.exports = {
    getAll,
    post,
    put,
    getOne,
    remove
}