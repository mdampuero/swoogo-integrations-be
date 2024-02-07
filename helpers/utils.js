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

module.exports = {
    calcPage,
    integrationTypes,
    encryptPassword,
    buildError
}