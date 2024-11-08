const { response, request } = require("express");
const Integration = require("../models/integration");
const Transaction = require("../models/transaction");
const { integrationQuery } = require('../helpers/integration');
const { calcPage, base64ToFile } = require('../helpers/utils');
const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");
const { log } = require("winston");
const { swoogoRegistrantsSetScan } = require("../helpers/swoogo-registrants");

const integrationsGet = async (req = request, res = response) => {
    let { limit, sort, direction, offset, query } = integrationQuery(req);
    const [total, result] = await Promise.all([
        Integration.countDocuments(query),
        Integration.find(query)
            .sort([[sort, direction]])
            .limit(limit)
            .skip(offset)
    ])
    return res.json({
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
        const integration = await Integration.findById(id);
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

const integrationsSendRequest = async (req, res = response) => {
    try {
        const body = req.body;
        /** Update data in Swoogo */
        const formData = new FormData();
        formData.append(body.integration.request_field, body.value);
        await axios.put(`${process.env.SWOOGO_APIURL}registrants/update/${body.registrantId}.json`, formData, {
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        return res.json(body)
    } catch (error) {
        return res.status((typeof error.status != "undefined") ? error.status : 500).json({
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
    if (body.pictureBackgroundBase64)
        body.pictureBackground = await base64ToFile(req.body.pictureBackgroundBase64);
    const integration = new Integration(body);
    await integration.save();
    res.json({
        integration
    })
}

const integrationsPut = async (req, res = response) => {
    const { id } = req.params;
    const body = req.body;
    if (body.pictureBackgroundBase64)
        body.pictureBackground = await base64ToFile(body.pictureBackgroundBase64);
    const integration = await Integration.findByIdAndUpdate(id, body, { new: true });
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

const integrationsRegistrant = async (req = request, res = response) => {
    try {
        const { id, sessionId } = req.params;
        const { registrantIDs } = req.body;

        /* Check integration */
        const integration = await Integration.findById(id);
        if (integration.type != 'CHECKIN') {
            throw {
                status: 400,
                message: 'Invalid integration type. Expected CHECKIN.'
            };
        }

        /* Set scan new registrant */
        for (let i = 0; i < registrantIDs.length; i++) {
            await swoogoRegistrantsSetScan(sessionId, registrantIDs[i])
        }

        /* Get All registrant */
        const allItems = await getAllRegistrant(integration.event_id);

        /* Get All registrant scanned */
        const allItemsScanned = await getAllRegistrantScanned(integration.event_id, sessionId);

        const scannedMap = new Map(allItemsScanned.map(item => [item.registrant_id, item.created_at]));
        const updatedItems = allItems.map(item => ({
            ...item,
            rut: item.c_4392417,
            scanned_at: scannedMap.get(item.id) || null,
            scanned: (scannedMap.get(item.id)) ? 'SERVER' : null
        }));

        return res.json({
            total: updatedItems.length,
            data: updatedItems
        });

    } catch (error) {
        return res.status(error.status || 500).json({
            "result": false,
            "message": error.message || "Internal Server Error"
        });
    }
}

const integrationsGetBySessionId = async (req = request, res = response) => {

    try {
        const { sessionId } = req.params;
        const instance = axios.create({
            baseURL: `${process.env.SWOOGO_APIURL}sessions/${sessionId}.json?fields=event_id,id`,
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        const resp = await instance.get();

        const integration = await Integration.findOne({
            event_id: resp.data.event_id,
            isActive: true,
            isDelete: false,
            type: 'CHECKIN'
        })
        if (!integration) {
            throw {
                response: { status: 404 },
                message: 'Invalid integration'
            };
        }
        return res.status(200).json({
            "result": true,
            "data": {
                "session_id": resp.data.id.toString(),
                "integration_id": integration.id,
                "event_id": integration.event_id,
                "event_name": integration.event.name,
                "extraOption": integration.extraOption,
                "request": integration.request,
                "request_options": integration.request_options,
                "request_field": integration.request_field,
                "request_input_type": integration.request_input_type,
                "request_label": integration.request_label
            }
        })

    } catch (error) {
        return res.status((typeof error.response != "undefined" && typeof error.response.status != "undefined") ? error.response.status : 500).json({
            "result": false,
            "data": error
        })
    }
}

const getAllRegistrant = async (eventId) => {
    const allItems = [];
    let currentPageAll = 1;
    let totalPagesAll = 1;

    const instance = axios.create({
        baseURL: process.env.SWOOGO_APIURL,
        headers: { "Authorization": "Bearer " + await authentication() }
    });

    while (currentPageAll <= totalPagesAll) {
        const response = await instance.get(`registrants.json?event_id=${eventId}&fields=*&per-page=100&page=${currentPageAll}`);
        const { items, _meta } = response.data;

        allItems.push(...items);

        totalPagesAll = _meta.pageCount;
        currentPageAll++;
    }

    return allItems;
}

const getAllRegistrantScanned = async (eventId, sessionId) => {
    const allItemsScanned = [];
    let currentPageScanned = 1;
    let totalPagesScanned = 1;

    const instance = axios.create({
        baseURL: process.env.SWOOGO_APIURL,
        headers: { "Authorization": "Bearer " + await authentication() }
    });

    while (currentPageScanned <= totalPagesScanned) {
        const response = await instance.get(`scans/sessions.json?session_id=${sessionId}&event_id=${eventId}&fields=registrant_id,created_at&per-page=100&page=${currentPageScanned}`);
        const { items, _meta } = response.data;
        console.log(items);
        console.log(sessionId, eventId);
        allItemsScanned.push(...items);

        totalPagesScanned = _meta.pageCount;
        currentPageScanned++;
    }

    return allItemsScanned;
}


module.exports = {
    integrationsGet,
    integrationsPost,
    integrationsPut,
    integrationsDelete,
    integrationsGetOne,
    integrationsStats,
    integrationsTransactions,
    integrationsGetSession,
    integrationsRegistrant,
    integrationsGetBySessionId,
    integrationsSendRequest
}