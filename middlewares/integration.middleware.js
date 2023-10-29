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
    switch (body.type) {
        case 'MERCADOPAGO':
            if (typeof body.access_token == "undefined" || !body.access_token)
                errors.push(buildError("access_token", "El campo 'access_token' es requerido", "access_token"));

            if (typeof body.item_currency == "undefined" || !body.item_currency || !['CLP'].includes(body.item_currency))
                errors.push(buildError("item_currency", "El campo 'item_currency' es requerido", "item_currency"));
            
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