const { response } = require("express");
const Setting = require("../models/setting");
const Event = require("../models/event");
const { getSetting } = require('../helpers/setting');
const { base64ToFile } = require('../helpers/utils');
const settingsGetOne = async (req, res = response) => {
    const setting = await getSetting();
    res.json({
        setting
    })
}

const settingsPut = async (req, res = response) => {
    const { max_slider_home, max_slider_similar, max_slider_categories, max_slider_last, banner_link, bannerBase64,slider_home } = req.body;
    let setting = await Setting.findOne();
    if (!setting) {
        setting = await Setting.create({
            max_slider_home,
            max_slider_similar,
            max_slider_categories,
            max_slider_last,
            banner_link,
        });
    } else {
        setting.max_slider_home = max_slider_home;
        setting.max_slider_similar = max_slider_similar;
        setting.max_slider_categories = max_slider_categories;
        setting.max_slider_last = max_slider_last;
        setting.banner_link = banner_link;
        if (bannerBase64)
            setting.banner = await base64ToFile(bannerBase64);
        setting.save();
    }
    if(slider_home){
        slider_home.forEach(async slider => {
            eventEntity = await Event.findById(slider.id);
            eventEntity.order = slider.order;
            eventEntity.save();
        });
    }
    res.json({
        slider_home
    })
}

const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
    settingsPut,
    settingsGetOne
}