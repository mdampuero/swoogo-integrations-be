const { response, request } = require("express");
const Demo = require("../models/demo");
const { demoQuery } = require('../helpers/demo');
const { calcPage } = require('../helpers/utils');
const nodemailer = require('nodemailer');
const demosGet = async (req = request, res = response) => {
    var transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "a4140ccebccb5f",
            pass: "ad647ff494915d"
        }
    });
    const mailOptions = {
        from: 'tu_correo@gmail.com',
        to: 'destinatario@example.com',
        subject: 'Prueba de envío de correo electrónico con Nodemailer y Node.js',
        text: 'Este es un correo de prueba enviado con Nodemailer y Node.js'
    };

    // Enviar el correo electrónico
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error('Error al enviar el correo electrónico:', error);
        } else {
            console.log('Correo electrónico enviado correctamente:', info.response);
        }
    });

    const { limit, sort, direction, offset, query } = demoQuery(req);
    const [total, result] = await Promise.all([
        Demo.countDocuments(query),
        Demo.find(query)
            .sort([[sort, direction]])
            .limit(limit)
            .skip(offset)
    ])
    res.json({
        total,
        pages: calcPage(total, limit),
        limit,
        data: result
    })
}

const demosGetOne = async (req, res = response) => {
    const { id } = req.params;
    const demo = await Demo.findById(id);
    res.json({
        demo
    })
}

const demosPost = async (req, res = response) => {
    const { name, description } = req.body;
    const demo = new Demo({ name, description });
    await demo.save();
    res.json({
        demo
    })
}

const demosPut = async (req, res = response) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const demo = await Demo.findByIdAndUpdate(id, { name, description }, { new: true });
    res.json({
        demo
    })
}

const demosDelete = async (req, res = response) => {
    const { id } = req.params;
    const demo = await Demo.findByIdAndUpdate(id, { isDelete: true }, { new: true });
    res.json({
        demo
    })
}

module.exports = {
    demosGet,
    demosPost,
    demosPut,
    demosDelete,
    demosGetOne
}