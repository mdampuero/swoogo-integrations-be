const { response, request } = require("express");
const { Category } = require("../models");

const categoriesGet = async (req = request, res = response) => {
    const { page = '1', offset = '0', limit = '50' } = req.query;
    const query = { isDelete: false }

    const [total, result] = await Promise.all([
        Category.countDocuments(query),
        Category.find(query)
            .populate("user",'name')
            .limit(Number(limit))
            .skip(Number(offset))
    ])
    res.json({
        total,
        result
    })
}

const categoriesGetOne = async (req, res = response) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category)
            throw 'The id is not valid';
        res.json({
            category
        });
    } catch (e) {
        return res.status(400).json({
            response: e
        })
    }
}

const categoriesPost = async (req, res = response) => {
    try {
        const { name } = req.body;
        const categoryDB = await Category.findOne({ name, isDelete: false });
        if (categoryDB)
            throw 'The category already exist';
        const category = new Category({ name, user: req.user._id });
        await category.save();
        res.status(201).json({
            category
        })
    } catch (e) {
        return res.status(400).json({
            response: e
        })
    }
}

const categoriesPut = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { _id, ...resto } = req.body;
        const category = await Category.findByIdAndUpdate(id, resto, { new: true });
        res.json({
            category
        })
    } catch (e) {
        return res.status(400).json({
            response: e
        })
    }
   
}

const categoriesDelete = async (req, res = response) => {
    // const { id } = req.params;
    // const user = await User.findByIdAndUpdate(id, { isDelete: true }, { new: true });
    // res.json({
    //     user
    // })
    res.json("ok")
}

module.exports = {
    categoriesGet,
    categoriesPost,
    categoriesPut,
    categoriesDelete,
    categoriesGetOne
}