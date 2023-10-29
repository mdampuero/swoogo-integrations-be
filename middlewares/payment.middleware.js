const Integration = require("../models/integration");
const axios = require('axios');
const { authentication } = require("../helpers/swoogo-auth");

const existRegistrant = async (req = request, res, next) => {
    try {
        const { registrant_id } = req.body
        const instance = axios.create({
            baseURL: `${process.env.SWOOGO_APIURL}registrants/${registrant_id}.json`,
            headers: { "Authorization": "Bearer " + await authentication() }
        });
        const resp = await instance.get();
        const registrant = resp.data;
        if (!registrant) 
            throw "The 'registrant_id' is not valid";
        req.registrant = registrant
        next();
    } catch (e) {
        return res.status(404).json({
            response: e
        })
    }
}

const existIntegration = async (req = request, res, next) => {
    try {
        const { integration_id } = req.body;
        const integration = await Integration.findOne({ _id: integration_id, isDelete: false, isActive: true });
        if (!integration) 
            throw "The 'integration_id' is not valid";
        req.integration = integration
        next();
    } catch (e) {
        return res.status(404).json({
            response: e
        })
    }
}

module.exports = {
    existRegistrant,
    existIntegration
}