const { response, request } = require("express");
const Category = require("../models/category");
const { categoryQuery } = require('../helpers/category');
const { calcPage } = require('../helpers/utils');

const categoriesGet = async (req = request, res = response) => {
    const { limit, sort, direction, offset, query } = categoryQuery(req);
    const [total, result] = await Promise.all([
        Category.countDocuments(query),
        Category.find(query)
            .sort([[sort, direction]])
            .limit(limit)
            .skip(offset)
    ])
    res.json({
        total,
        pages: calcPage(total, limit),
        limit,
        data: result
    })
}

const categoriesGetOne = async (req, res = response) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    res.json({
        category
    })
}

const categoriesPost = async (req, res = response) => {
    const { id, ...body } = req.body;
    const category = new Category(body);
    await category.save();
    res.json({
        category
    })
}

const categoriesPut = async (req, res = response) => {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    res.json({
        category
    })
}

const categoriesDelete = async (req, res = response) => {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, { isDelete: true }, { new: true });
    res.json({
        category
    })
}
const home = async (req = request, res = response) => {
    const [result] = await Promise.all([
        Category.find({isDelete: false, inHome:true})
            .limit(10)
    ])
    res.json({
        data: result
    })
}
module.exports = {
    categoriesGet,
    categoriesPost,
    categoriesPut,
    categoriesDelete,
    categoriesGetOne,
    home
}