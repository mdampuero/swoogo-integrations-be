const { response, request } = require("express");
const User = require("../models/user");
const bcryptjs = require('bcryptjs');
const { generateJWT } = require("../helpers/generate-jwt");
const { buildError } = require('../helpers/utils');
// const { googleVerify } = require("../helpers/google-verify");

const login = async (req, res = response) => {
    const { email, password } = req.body;
    let errors = [];
    try {
        const user = await User.findOne({ email, isDelete: false });
        if (!user) 
            errors.push(buildError("email", "User or password is not valid", "email"));
        else {
            const validPassword = bcryptjs.compareSync(password, user.password);
            if (!validPassword) 
                errors.push(buildError("email", "User or password is not valid", "email"));
        }
        if (errors.length > 0) {
            return res.status(400).json({
                "result": false,
                "data": {
                    "errors": errors
                }
            });
        }else{
            const token = await generateJWT(user.id);
            return res.json({
                token,
                name: user.name,
                email: user.email
            })
        }
        
    } catch (error) {
        res.status(500).json({
            "msg": "Error"
        })
    }

}

// const googleSignIn = async (req, res = response) => {
//     const { google_token } = req.body;
//     try {
//         const { name, email } = await googleVerify(google_token)

//         let user = await User.findOne({ email });
//         if(!user){
//             const data = {
//                 name,
//                 email,
//                 password:':P',
//                 googleLogin:true,
//                 role: 'ADMIN_ROLE'
//             }
//             user = new User(data);
//             await user.save();
//         }
//         const token = await generateJWT(user.id);
//         return res.json({
//             user,
//             token
//         })
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             "msg": "Error"
//         })
//     }

// }

module.exports = {
    login,
    // googleSignIn
}