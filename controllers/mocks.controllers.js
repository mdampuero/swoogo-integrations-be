const { response, request } = require("express");

const mockPost = async (req, res = response) => {
    const { channel, payload } = req.body;
    if(!channel || !payload){
        res.status(400).json({
            message: 'Channel or Payload is not present in body'
        })
    }
    req.io.emit(channel, payload);
    res.json({
        result: "OK"
    })
}

module.exports = {
    mockPost
}