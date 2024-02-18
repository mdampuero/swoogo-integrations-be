const bcryptjs = require('bcryptjs');

const encryptPassword = async (password) => {
    const salt = bcryptjs.genSaltSync(10);
    user.password = bcryptjs.hashSync(salt);
}

const calcPage = (total, limit) => {
    let pages = ((total % limit) == 0) ? (total / limit) : Math.trunc((total / limit)) + 1
    return pages;
}

const integrationTypes = () => {
    return [
        'MERCADOPAGO',
        'WEBSERVICE'
    ]
}

const buildError = (path, msg, value) => {
    return {
        "type": "field",
        "value": value,
        "msg": msg,
        "path": path,
        "location": "body"
    }
}

const getValueByKey = (key, object) => {
    return object.hasOwnProperty(key) ? object[key] : null;
}

const getValueOrNull = (value) => {
    return (value) ? value : ""
}

const parseErrorSwoogo = (error) => {
    let errorMessage = error.response.data.message;
    const statusCode = error.response.status;
    if (statusCode == 422) {
        errorMessage = error.response.data[0].message
    }
    return { errorMessage, statusCode }
}

const convertJson2Form = (body, objectMap) => {
    const formData = new FormData();
    for (const key in body) {
        if (Object.hasOwnProperty.call(body, key)) {
            const value = body[key];
            if (typeof value === 'object' && value !== null) {
                formData.append(key, JSON.stringify(value));
            } else {
                if (val = getValueByKey(key, objectMap)) {
                    formData.append(val, value);
                } else {
                    formData.append(key, value);
                }
            }
        }
    }
    return formData
}

const getString = (object) => {
    var values = [];
    for (var clave in object) {
        if (object.hasOwnProperty(clave)) {
            values.push(object[clave]);
        }
    }
    return values.join(',');
}

const deconstructAnswer = (answer, mapper) => {
    const result = {};
    for (const key in mapper) {
        result[key] = getValueOrNull(answer[mapper[key]]);
    }
    return result;
}

const getAllFields = (items, mapper) => {
    const results = [];
    items.forEach(function (item) {
        results.push(deconstructAnswer(item, mapper));
    });
    return results;
}

module.exports = {
    calcPage,
    integrationTypes,
    encryptPassword,
    buildError,
    getValueByKey,
    getValueOrNull,
    parseErrorSwoogo,
    convertJson2Form,
    getString,
    deconstructAnswer,
    getAllFields
}