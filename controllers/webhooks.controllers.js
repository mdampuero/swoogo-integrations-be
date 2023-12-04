const { response, request } = require("express");
const Integration = require("../models/integration");
const Transaction = require("../models/transaction");
const Registrant = require("../models/registrant");


const webhookPost = async (req = request, res = response) => {
    const body = req.body;
    console.log(body)
    if (body.action == "insert" && body.object == "registrant") {
        const registrant = await Registrant.findOne({ swoogo_event_id: body.registrant.event_id, email: body.registrant.email });
        if (registrant) {
            registrant.swoogo_id = body.registrant.id
            registrant.swoogo_data = body.registrant
            registrant.save();
            res.json({
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