const { response, request } = require("express");
const Integration = require("../models/integration");
const Transaction = require("../models/transaction");
const Checkin = require("../models/checkin");
const { integrationQuery } = require('../helpers/integration');
const { calcPage, base64ToFile } = require('../helpers/utils');
const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");
const { log } = require("winston");
const { swoogoRegistrantsSetScan, swoogoSendRequest } = require("../helpers/swoogo-registrants");
const { localRegistrantsSetScan, localSendRequest } = require("../helpers/local-registrants");
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');
const { format } = require('date-fns');
const checkin = require("../models/checkin");

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

const integrationsCheckins = async (req, res = response) => {
    const { id } = req.params;
    const chekins = await Checkin.find({ integration: id });
    res.json({
        data: chekins
    })
}

const integrationsCheckinsDelete = async (req, res = response) => {
    try {
        const { id } = req.params;

        const result = await Checkin.deleteMany({ integration: id });

        res.json({
            message: 'All checkins deleted successfully.',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({
            message: 'An error occurred while deleting checkins.',
            error
        });
    }
};

const integrationsCheckinsDownloads = async (req, res = response) => {
    const { id } = req.params;
    let data = [];
    const integration = await Integration.findById(id);
    const items = await Checkin.find({ integration: id });
    const fileName = 'Checkins_' + id + '.csv';
    let headers = [
        { id: 'rut', title: 'RUT' },
        { id: 'created', title: 'Fecha' }
    ];
    if (integration.request) {
        headers.push({ id: 'request', title: integration.request_label });
    }

    const csvWriter = createObjectCsvWriter({
        path: fileName,
        header: headers
    });
    items.forEach(item => {
        const friendlyDate = format(new Date(item.created_at), 'dd/MM/yyyy HH:mm');
        let object = { rut: item.document, created: friendlyDate };
        if (integration.request) {
            object.request = item.request_value;
        }
       // console.log('object', object);
        data.push(object);
    });

    csvWriter.writeRecords(data)
        .then(() => {
            res.download(fileName, (err) => {
                if (err) {
                    console.error('Error al descargar el archivo:', err);
                } else {
                    // Elimina el archivo después de enviarlo
                    fs.unlinkSync(fileName);
                }
            });
        })
        .catch((error) => {
            res.status(500).send('Error al crear el archivo CSV.');
        });
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
        const integration = await Integration.findById(body.integrationId);
        if(integration.type == 'REGISTER'){
            localSendRequest(body.registrantId, integration, {
                name: body.request_label,
                value: body.value
            })
        }else{
            swoogoSendRequest(body.registrantId, {
                name: body.request_field,
                value: body.value
            })
        }
        return res.json(null)
    } catch (error) {
        return res.status(200).json({
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
    if (body.pictureFooterBase64)
        body.pictureFooter = await base64ToFile(req.body.pictureFooterBase64);
    if (body.pictureActionBase64)
        body.pictureAction = await base64ToFile(req.body.pictureActionBase64);
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
    if (body.pictureFooterBase64)
        body.pictureFooter = await base64ToFile(body.pictureFooterBase64);
    if (body.pictureActionBase64)
        body.pictureAction = await base64ToFile(req.body.pictureActionBase64);
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
        const { registrantIDs, results } = req.body;
        // console.log('registrantIDs', registrantIDs);
        // console.log('results', results);

        /* Check integration */
        const integration = await Integration.findById(id);
        if (integration.type != 'CHECKIN' && integration.type != 'REGISTER') {
            throw {
                status: 400,
                message: 'Invalid integration type. Expected CHECKIN.'
            };
        }

        /* Set scan new registrant */
        for (let i = 0; i < registrantIDs.length; i++) {
            if (integration.type == 'REGISTER') {
                await localRegistrantsSetScan(registrantIDs[i], integration)
            } else {
                await swoogoRegistrantsSetScan(sessionId, registrantIDs[i])
            }
        }

        /** Send request */
        if (integration.request) {
            for (let i = 0; i < results.length; i++) {
                if (typeof results[i].requestValue !== 'undefined') {
                    if (integration.type == 'REGISTER') {
                        localSendRequest(results[i].externalId, integration, {
                            name: integration.request_label,
                            value: results[i].requestValue
                        });
                    } else {
                        swoogoSendRequest(results[i].externalId, {
                            name: integration.request_field,
                            value: results[i].requestValue
                        });
                    }
                }
            }
        }

        if (integration.type == 'CHECKIN') {
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
        } else {
            const checkins = await Checkin.find({ integration: integration.id });
            /**
             * ONLY REGISTER
             */
            const updatedItems = checkins.map(item => ({
                rut: item.document,
                event_id: integration.event_id,
                id: item.document.replace(/[^0-9]/g, ''),
                first_name: "",
                last_name: "",
                email: "",
                scanned_at: item.created_at,
                scanned: "SERVER"
            }));
            return res.json({
                total: updatedItems.length,
                data: updatedItems
            });
        }

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
        let integration;
        if (sessionId.startsWith('0')) {
            integration = await Integration.findOne({
                access_code: sessionId,
                isActive: true,
                isDelete: false,
                type: 'REGISTER'
            });
        } else {
            const instance = axios.create({
                baseURL: `${process.env.SWOOGO_APIURL}sessions/${sessionId}.json?fields=event_id,id`,
                headers: { "Authorization": "Bearer " + await authentication() }
            });
            const resp = await instance.get();
            integration = await Integration.findOne({
                event_id: resp.data.event_id,
                isActive: true,
                isDelete: false,
                type: 'CHECKIN'
            });
        }

        if (!integration) {
            throw {
                response: { status: 404 },
                message: 'Invalid integration'
            };
        }
        return res.status(200).json({
            "result": true,
            "data": {
                "session_id": sessionId,
                "integration_id": integration.id,
                "integration_type": integration.type,
                "event_id": integration.event_id,
                "event_name": integration.event.name,
                "extraOption": integration.extraOption,
                "request": integration.request,
                "print": integration.print,
                "print_fields": integration.print_fields,
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
    integrationsSendRequest,
    integrationsCheckins,
    integrationsCheckinsDelete,
    integrationsCheckinsDownloads
}