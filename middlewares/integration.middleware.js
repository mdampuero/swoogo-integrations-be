const Integration = require("../models/integration");
const { integrationTypes, buildError } = require('../helpers/utils');

const isIntegrationExist = async (id) => {
    const exist = await Integration.findById(id);
    if (!exist) {
        throw new Error('This entity "' + id + '" is not exist');
    }
}

const isIntegrationTypeValid = async (type) => {
    const types = integrationTypes();
    if (!types.includes(type)) {
        throw new Error("El campo 'type' no es soportado, solo se admiten [" + types.join(',') + "]");
    }
}

const checkFieldByType = async (req = request, res, next) => {
    const body = req.body;
    let errors = [];
    let conditions = {
        event_id: body.event_id,
        type: body.type,
        isDelete: false
    }
    if (body.id) {
        conditions._id = { $ne: body.id }
    }
    const existEventAndType = await Integration.findOne(conditions);
    if (existEventAndType) {
        errors.push(buildError("type", "Ya existe una integración del mismo tipo para ese Evento", "type"));
    }
    switch (body.type) {
        case 'MERCADOPAGO':
            if (typeof body.access_token == "undefined" || !body.access_token)
                errors.push(buildError("access_token", "El campo 'access_token' es requerido", "access_token"));

            if (typeof body.item_currency == "undefined" || !body.item_currency || !['CLP', 'ARS'].includes(body.item_currency))
                errors.push(buildError("item_currency", "El campo 'item_currency' es requerido", "item_currency"));

            break;
        case 'WEBSERVICE':
            if (typeof body.access_token == "undefined" || !body.access_token)
                errors.push(buildError("access_token", "El campo 'access_token' es requerido", "access_token"));
            if (typeof body.email_enabled == "undefined" || body.email_enabled == 1){
                if (typeof body.email_type == "undefined" || !body.email_type){
                    errors.push(buildError("email_type", "El campo 'Label' es requerido", "email_type"));
                }
            }
            break;
        case 'REGISTER':
            if (typeof body.access_code == "undefined" || !body.access_code)
                errors.push(buildError("access_code", "El campo 'access_code' es requerido", "access_code"));

            if (typeof body.request == "undefined" || body.request == 1){
                if (typeof body.request_label == "undefined" || !body.request_label){
                    errors.push(buildError("request_label", "El campo 'Tipo email (Swoogo)' es requerido", "request_label"));
                }
                if (typeof body.request_input_type == "undefined" || !body.request_input_type){
                    errors.push(buildError("request_input_type", "El campo 'Tipo de respuesta' es requerido", "request_input_type"));
                }

            }
            break;
        case 'CHECKIN':
            if (typeof body.request == "undefined" || body.request == 1){
                if (typeof body.request_label == "undefined" || !body.request_label){
                    errors.push(buildError("request_label", "El campo 'Label' es requerido", "request_label"));
                }
                if (typeof body.request_field == "undefined" || !body.request_field){
                    errors.push(buildError("request_field", "El campo 'Campo (ID de swoogo)' es requerido", "request_field"));
                }
                if (typeof body.request_input_type == "undefined" || !body.request_input_type){
                    errors.push(buildError("request_input_type", "El campo 'Tipo de respuesta' es requerido", "request_input_type"));
                }

            }
            break;
    }
    if (errors.length > 0) {
        return res.status(400).json({
            "result": false,
            "data": {
                "errors": errors
            }
        });
    } else {
        next();
    }

}

module.exports = {
    isIntegrationTypeValid,
    isIntegrationExist,
    checkFieldByType
}