const { response, request } = require("express");
const Integration = require("../models/integration");
const Transaction = require("../models/transaction");
const Registrant = require("../models/registrant");
const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");
const FormData = require('form-data');

const webhookPost = async (req = request, res = response) => {
    const body = req.body;
    if (body.action == "insert" && body.object == "registrant") {
        const registrants = await Registrant.find({ swoogo_event_id: body.registrant.event_id, email: body.registrant.email })
            .populate("transaction", 'status');
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
                }
            });
            return res.json({
                "result": "OK"
            })
        }
    }
    return res.status(404).json({
        "result": "Not found registrant"
    })
}
module.exports = {
    webhookPost
}