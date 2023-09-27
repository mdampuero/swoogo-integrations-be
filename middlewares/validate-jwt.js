const jwt = require('jsonwebtoken');
const User = require("../models/user");

const validatJWT = async (req = request, res, next) => {
    const token = req.header('x-token');
    try {
        if (!token)
            throw 'The x-token is not valid';
        const { uid } = jwt.verify(token, process.env.SECRET)
        const user = await User.findById(uid);
        if (!user)
            throw 'The user is not valid';
        if(user.isDelete)
            throw 'The user is delete';
        req.user = user
        next();
    } catch (e) {
        return res.status(401).json({
            response: e
        })
    }
}

module.exports = {
    validatJWT
}