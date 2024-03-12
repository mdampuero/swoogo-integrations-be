const { response, request } = require("express");
const Notification = require("../models/notification");
const { notificationQuery } = require('../helpers/notification');
const { calcPage, sendEmail } = require('../helpers/utils');


const notificationsGet = async (req = request, res = response) => {
    const { limit, sort, direction, offset, query } = notificationQuery(req);
    const [total, result] = await Promise.all([
        Notification.countDocuments(query),
        Notification.find(query)
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

const notificationsGetOne = async (req, res = response) => {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    res.json({
        notification
    })
}

const notificationsPost = async (req, res = response) => {

    const { name, payload, type } = req.body;
    const subject = 'Consulta enviada desde el formulario de contacto';
    const emailBody = `
        <h3>${subject}</h3>
        <hr>
        <p><b>Nombre:</b> ${payload.first_name}</p>
        <p><b>Apellido</b>: ${payload.last_name}</p>
        <p><b>Email</b>: <a href="mailto:${payload.email}">${payload.email}</a></p>
        <p><b>Asunto</b>: ${payload.subject}</p>
        <p><b>Mensaje</b>: ${payload.message}</p>`
    const response = await sendEmail(subject,emailBody);
    const notification = new Notification({ name, type, payload, response });
    await notification.save();

    res.json({
        notification
    })
}

const notificationsDelete = async (req, res = response) => {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { isDelete: true }, { new: true });
    res.json({
        notification
    })
}

module.exports = {
    notificationsGet,
    notificationsPost,
    notificationsDelete,
    notificationsGetOne
}