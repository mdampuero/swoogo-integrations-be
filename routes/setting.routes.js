const { Router } = require('express');
const { settingsPut, settingsGetOne } = require('../controllers/settings.controllers');
const { check } = require('express-validator');

const { validateFields } = require('../middlewares/validate');

const router = Router();

router.get('/', [], settingsGetOne);

router.put('/', [
    check('max_slider_home', 'The "max_slider_home" is required').not().isEmpty(),
    check('max_slider_similar', 'The "max_slider_similar" is required').not().isEmpty(),
    check('max_slider_categories', 'The "max_slider_categories" is required').not().isEmpty(),
    check('max_slider_last', 'The "max_slider_last" is required').not().isEmpty(),
    // check('banner_link', 'The "Link" is invalid').isURL(),
    validateFields
], settingsPut);

module.exports = router