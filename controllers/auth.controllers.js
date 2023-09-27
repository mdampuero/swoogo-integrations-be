const { response, request } = require("express");
const User = require("../models/user");
const bcryptjs = require('bcryptjs');
const { generateJWT } = require("../helpers/generate-jwt");
const { googleVerify } = require("../helpers/google-verify");

const login = async (req, res = response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, isDelete: false });
        if (!user) {
            return res.status(400).json({
                "msg": "User or password is not valid"
            })
        }

        const validPassword = bcryptjs.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(400).json({
                "msg": "User or password is not valid"
            })
        }

        const token = await generateJWT(user.id);

        return res.json({
            user,
            token
        })
    } catch (error) {
        res.status(500).json({
            "msg": "Error"
        })
    }

}

const googleSignIn = async (req, res = response) => {
    const { google_token } = req.body;
    try {
        const { name, email } = await googleVerify(google_token)

        let user = await User.findOne({ email });
        if(!user){
            const data = {
                name,
                email,
                password:':P',
                googleLogin:true,
                role: 'ADMIN_ROLE'
            }
            user = new User(data);
            await user.save();
        }
        const token = await generateJWT(user.id);
        return res.json({
            user,
            token
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "msg": "Error"
        })
    }

}

module.exports = {
    login,
    googleSignIn
}