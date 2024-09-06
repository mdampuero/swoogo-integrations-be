const Setting = require("../models/setting");

const getSetting = async () => {
    let setting = await Setting.findOne();
    
    const maxSliderHome = (setting && setting['max_slider_home']) ? setting.max_slider_home : 10;
    const maxSliderSimilar = setting && setting['max_slider_similar'] ? setting.max_slider_similar : 10;
    const maxSliderCategories = setting && setting['max_slider_categories'] ? setting.max_slider_categories : 10;
    const maxSliderLast = setting && setting['max_slider_last'] ? setting.max_slider_last : 10;
    const banner = setting && setting['banner'] ? setting.banner : '';
    const banner_link = setting && setting['banner_link'] ? setting.banner_link : '';
    const contact_email = setting && setting['contact_email'] ? setting.contact_email : '';

    return {
        max_slider_home: maxSliderHome,
        max_slider_similar: maxSliderSimilar,
        max_slider_categories: maxSliderCategories,
        max_slider_last: maxSliderLast,
        banner: banner,
        banner_link: banner_link,
        contact_email: contact_email,
    };
}

module.exports = {
    getSetting
}