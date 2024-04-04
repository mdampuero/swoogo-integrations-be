const { response, request } = require("express");
const Event = require("../models/event");
const { eventQuery } = require('../helpers/event');
const { calcPage, base64ToFile } = require('../helpers/utils');
const { getSetting } = require('../helpers/setting');

const eventsGet = async (req = request, res = response) => {
    const { limit, sort, direction, offset, query } = eventQuery(req);
    const [total, result] = await Promise.all([
        Event.countDocuments(query),
        Event.find(query)
            .sort([[sort, direction]])
            .limit(limit)
            .skip(offset)
            .populate('category')
    ])
    res.json({
        total,
        pages: calcPage(total, limit),
        limit,
        data: result
    })

    // const currentDate = new Date();
    // const [results] = await Promise.all([
    //     Event.find({ isDelete: false, isActive: true,  end_date: { $lte: currentDate },end_date: { $lte: currentDate }})
    // ])
    // results.forEach(result => {
    //     result.isActive = false;
    //     result.save();
    // });
    // res.json({
    //     data: results
    // })
}

const eventsGetAll = async (req = request, res = response) => {
    const { limit, sort, direction, offset, query } = eventQuery(req);
    const [total, result] = await Promise.all([
        Event.countDocuments({ isDelete: false, isActive: true }),
        Event.find({ isDelete: false, isActive: true })
            .sort([[sort, direction]])
            .skip(offset)
            .populate('category')
    ])
    res.json({
        total,
        pages: calcPage(total, limit),
        limit,
        data: result
    })
}

const sliderHome = async (req = request, res = response) => {
    const setting = await getSetting();
    const [result] = await Promise.all([
        Event.find({ isDelete: false, isActive: true, inHome: true })
            .limit(setting.max_slider_home)
            .sort([["order","ASC"]])
            .populate('category')
    ])
    res.json({
        data: result
    })
}

const last = async (req = request, res = response) => {
    const setting = await getSetting();
    const [result] = await Promise.all([
        Event.find({ isDelete: false, isActive: true })
            .sort({ start_date: 1 })
            .limit(setting.max_slider_last + 1)
            .populate('category')
    ]);
    let more = false;
    if (result.length > setting.max_slider_last) {
        more = true;
        result.pop();
    }
    res.json({
        data: result,
        more
    })
}

const similar = async (req = request, res = response) => {
    const { id } = req.params;
    const setting = await getSetting();
    // await delay(2000);
    const [result] = await Promise.all([
        Event.find({ isDelete: false, isActive: true, _id: { $ne: id } })
            .sort({ created_at: -1 })
            .limit(setting.max_slider_similar + 1)
            .populate('category')
    ])
    let more = false;
    if (result.length > setting.max_slider_similar) {
        more = true;
        result.pop();
    }
    res.json({
        data: result,
        more
    })
}

const eventsGetOne = async (req, res = response) => {
    const { id } = req.params;
    const event = await Event.findById(id).populate('category');
    res.json({
        event
    })
}

const eventsPost = async (req, res = response) => {
    const { id, ...body } = req.body;
    if (body.pictureBackgroundBase64)
        body.pictureBackground = await base64ToFile(req.body.pictureBackgroundBase64);
    if (body.pictureCardBase64)
        body.pictureCard = await base64ToFile(req.body.pictureCardBase64);

    const event = new Event(body);
    await event.save();
    res.json({
        event
    })
}

const eventsPut = async (req, res = response) => {
    const { id } = req.params;
    const body = req.body;
    if (body.pictureBackgroundBase64)
        body.pictureBackground = await base64ToFile(body.pictureBackgroundBase64);
    if (body.pictureCardBase64)
        body.pictureCard = await base64ToFile(body.pictureCardBase64);
    const event = await Event.findByIdAndUpdate(id, body, { new: true });
    res.json({
        event
    })
}

const eventsDelete = async (req, res = response) => {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(id, { isDelete: true }, { new: true });
    res.json({
        event
    })
}
const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
module.exports = {
    similar,
    eventsGet,
    eventsGetAll,
    eventsPost,
    eventsPut,
    eventsDelete,
    eventsGetOne,
    sliderHome,
    last
}