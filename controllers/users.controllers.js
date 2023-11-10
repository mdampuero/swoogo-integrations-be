const { response, request } = require("express");
const User = require("../models/user");
const bcryptjs = require('bcryptjs');
const { calcPage } = require('../helpers/utils');

const usersGet = async (req = request, res = response) => {
    const { page = '1', offset = '0', limit = '50' } = req.query;
    const query = { isDelete: false }

    const [total, result] = await Promise.all([
        User.countDocuments(query),
        User.find(query)
            .limit(Number(limit))
            .skip(Number(offset))
    ])
    res.json({
        total,
        pages: calcPage(total, limit),
        limit,
        data: result
    })
}

const usersGetOne = async (req, res = response) => {
    const { id } = req.params;
    const user = await User.findById(id);
    res.json({
        user
    })
}

const usersStats = async (req, res = response) => {
    res.json({
        total: await User.countDocuments({ isDelete: false })
    })
}

const usersPost = async (req, res = response) => {
    const { name, email, password, role, isActive } = req.body;
    const user = new User({ name, email, password, role : 'ADMIN_ROLE', isActive });

    const salt = bcryptjs.genSaltSync(10);
    user.password = bcryptjs.hashSync(password,salt);
    const userLogin = req.user;
    await user.save();
    res.json({
        user,
        userLogin
    })
}

const usersPut = async (req, res = response) => {
    const { id } = req.params;
    const { _id, googleLogin, password, email, ...resto } = req.body;
    resto.role = 'ADMIN_ROLE'
    if (password) {
        const salt = bcryptjs.genSaltSync(10);
        resto.password = bcryptjs.hashSync(password,salt);
    }

    const user = await User.findByIdAndUpdate(id, resto, { new: true });
    res.json({
        user
    })
}

const usersDelete = async (req, res = response) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { isDelete: true }, { new: true });
    res.json({
        user
    })
}

module.exports = {
    usersGet,
    usersPost,
    usersPut,
    usersDelete,
    usersGetOne,
    usersStats
}