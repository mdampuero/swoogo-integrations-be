const jwt = require('jsonwebtoken');
const Integration = require("../models/integration");

const validateAccessToken = async (req = request, res, next) => {
    const token = req.header('access-token');
    try {
        if (!token)
            throw 'The access-token is not valid';
        const integration = await Integration.findOne({ 
            access_token: token,
            isActive: true,
            isDelete: false
        });
        if (!integration)
            throw 'The The access-token is not valid';
        req.integration = integration
        next();
    } catch (e) {
        return res.status(401).json({
            response: e
        })
    }
}

module.exports = {
    validateAccessToken
}