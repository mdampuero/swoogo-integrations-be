const { response, request } = require("express");
const Reading = require("../models/reading");

const readingsGet = async (req = request, res = response) => {
    const { page = '1', offset = '0', limit = '50' } = req.query;

    const [total, result] = await Promise.all([
        Reading.countDocuments(),
        Reading.find()
            .limit(Number(limit))
            .skip(Number(offset))
    ])
    res.json({
        total,
        result
    })
}

const readingsPost = async (req, res = response) => {
    const { string } = req.body;
    let reading = await Reading.findOne({ string });
    if (reading)
        reading.count++;
    else
        reading = new Reading({ string });

    if (checkPass(reading.count)) {
        res.status(403).json({ message: "Error", max: process.env.MAX_READING });
    } else {
        await reading.save();
        res.json({
            reading,
            max: process.env.MAX_READING
        })
    }
}

const checkPass = (total) => {
    return (total > process.env.MAX_READING)
}

module.exports = {
    readingsGet,
    readingsPost
}