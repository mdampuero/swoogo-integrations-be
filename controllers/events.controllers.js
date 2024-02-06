const { response, request } = require("express");
const Event = require("../models/event");
const { eventQuery } = require('../helpers/event');
const { calcPage } = require('../helpers/utils');

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
}

const sliderHome = async (req = request, res = response) => {
    const { limit, sort, direction, offset, query } = eventQuery(req);
    const [result] = await Promise.all([
        Event.find({isDelete: false,isActive: true, inHome:true})
            .limit(10)
            .populate('category')
    ])
    res.json({
        data: result
    })
}

const last = async (req = request, res = response) => {
    const { limit, sort, direction, offset, query } = eventQuery(req);
    const [result] = await Promise.all([
        Event.find({isDelete: false,isActive: true })
            .sort({ created_at: -1 })
            .limit(10)
            .populate('category')
    ])
    res.json({
        data: result
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
    const event = new Event(body);
    await event.save();
    res.json({
        event
    })
}

const eventsPut = async (req, res = response) => {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(id, req.body, { new: true });
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

module.exports = {
    eventsGet,
    eventsPost,
    eventsPut,
    eventsDelete,
    eventsGetOne,
    sliderHome,
    last
}