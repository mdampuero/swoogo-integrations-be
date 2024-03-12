
const { notificationTypes, buildError, emailIsValid } = require('../helpers/utils');
const validator = require('validator');

const isNotificationTypeValid = async (type) => {
    const types = notificationTypes();
    if (!types.includes(type)) {
        throw new Error("El campo 'type' no es soportado, solo se admiten [" + types.join(',') + "]");
    }
}

const checkFieldByType = async (req = request, res, next) => {
    const body = req.body;
    let errors = [];
    switch (body.type) {
        case 'CONTACT':
            if (typeof body.payload.first_name == "undefined" || !body.payload.first_name)
                errors.push(buildError("first_name", "El campo 'Nombre' es requerido", "first_name"));
            if (typeof body.payload.last_name == "undefined" || !body.payload.last_name)
                errors.push(buildError("last_name", "El campo 'Apellido' es requerido", "last_name"));
            if (typeof body.payload.email == "undefined" || !validator.isEmail(body.payload.email))
                errors.push(buildError("email", "El campo 'Email' no es válido", "email"));
            if (typeof body.payload.subject == "undefined" || !body.payload.subject)
                errors.push(buildError("subject", "El campo 'Asunto' es requerido", "subject"));
            if (typeof body.payload.message == "undefined" || !body.payload.message)
                errors.push(buildError("message", "El campo 'Mensaje' es requerido", "message"));
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
    isNotificationTypeValid,
    checkFieldByType
}