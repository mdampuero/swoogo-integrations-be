const { response, request } = require("express");
const Integration = require("../models/integration");
const Transaction = require("../models/transaction");
const Registrant = require("../models/registrant");
const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");
const FormData = require('form-data');
const { logger } = require('../helpers/utils');

const webhookPost = async (req = request, res = response) => {
    try {
        const body = req.body;
        logger.info("Swoogo-Webhook-body")
        logger.info(body)
        if (body.action == "insert" && body.object == "registrant") {
            const registrants = await Registrant.find({ swoogo_event_id: body.registrant.event_id, email: body.registrant.email })
                .populate("transaction", 'status');
            logger.info("Registrant-Webhook")
            logger.info(registrants)
            if (registrants.length > 0) {
                registrants.forEach(async registrant => {
                    if (registrant.transaction.status == "approved") {
                        registrant.swoogo_id = body.registrant.id
                        registrant.swoogo_data = body.registrant
                        registrant.save();
                        /** Update data in Swoogo */
                        const formData = new FormData();
                        formData.append('c_3473417', '17536652');
                        const resp = await axios.put(`${process.env.SWOOGO_APIURL}registrants/update/${registrant.swoogo_id}.json`, formData, {
                            headers: { "Authorization": "Bearer " + await authentication() }
                        });
                        const jsonObject = { 'c_3473417': '17536652' };
                        logger.info("Registrant-Webhook-Put")
                        logger.info(jsonObject)
                        logger.info("Registrant-Webhook-Put-Response")
                        logger.info(resp.data)
                    }
                });
                return res.json({
                    "result": "OK"
                })
            }
        }
        logger.warn("Not found registrant")
        return res.status(404).json({
            "result": "Not found registrant"
        })
    } catch (error) {
        logger.error(error);
        res.status(500).send('Error interno del servidor');
    }
}
module.exports = {
    webhookPost
}