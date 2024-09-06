const bcryptjs = require('bcryptjs');
<<<<<<< Updated upstream
=======
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const validator = require('validator');
const winston = require("winston");
const { getSetting } = require('../helpers/setting');
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
=======
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

const base64ToFile = async (string) => {
    try {
        if (string == "##delete##") {
            return '';
        }
        const uploadFolder = 'uploads'
        const words = string.split(';base64,');
        const extension = words[0].replace('data:image/', '');
        const dataBuffer = Buffer.from(words[1], 'base64');
        const fileName = 'archivo_' + Date.now() + '.' + extension;
        const filePath = path.join('public', uploadFolder, fileName);
        // const schema = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = process.env.NODE_ENV === 'production' ? process.env.DOMAIN : 'http://localhost';
        const port = process.env.NODE_ENV === 'production' ? '' : ':' + process.env.PORT;
        await new Promise((resolve, reject) => {
            fs.writeFile(filePath, dataBuffer, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(fileName);
                }
            });
        });

        return `${host}${port}/${uploadFolder}/${fileName}`;
    } catch (error) {
        throw new Error('Error al escribir el archivo: ' + error.message);
    }
};
const sendEmail = async (subject, body) => {
    try {
        const setting = await getSetting();
        var transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: setting.contact_email,
            subject: subject,
            html: `<html><body>${body}</body></html>`
        };
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        throw error;
    }
}

const emailIsValid = async (string) => {
    const expresionRegular = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return expresionRegular.test(string);
}

const isRut = async (string) => {
    const regex = /^[1-9]\d{0,7}-(\d|k|K)$/;
    if (!regex.test(string)) {
        return false;
    }
    const [body, verifier] = string.split('-');
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += multiplier * parseInt(body.charAt(i), 10);
        multiplier = multiplier < 7 ? multiplier + 1 : 2;
    }

    const expectedVerifier = 11 - (sum % 11);
    if (expectedVerifier == 11) return verifier == '0';
    if (expectedVerifier == 10) return verifier == 'K';
    return verifier == expectedVerifier.toString();

}

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: "./public/uploads/app.log" }),
    ],
});

>>>>>>> Stashed changes
module.exports = {
    calcPage,
    integrationTypes,
    encryptPassword,
<<<<<<< Updated upstream
    buildError
=======
    buildError,
    getValueByKey,
    getValueOrNull,
    parseErrorSwoogo,
    convertJson2Form,
    getString,
    deconstructAnswer,
    getAllFields,
    notificationTypes,
    sendEmail,
    emailIsValid,
    isRut,
    logger
>>>>>>> Stashed changes
}