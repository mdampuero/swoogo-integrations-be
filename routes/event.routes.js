const { Router } = require('express');
const { eventsGet, eventsPut, eventsPost, eventsDelete, eventsGetOne, sliderHome, last, similar, eventsGetAll } = require('../controllers/events.controllers');
const { check } = require('express-validator');

const { validateFields } = require('../middlewares/validate');
const { validatJWT } = require('../middlewares/validate-jwt');
const { isUniqueName, isEventExist, isActive } = require('../middlewares/event.middleware');

const router = Router();

router.get('/', [
    // validatJWT
], eventsGet);

router.get('/all', [
    // validatJWT
], eventsGetAll);

router.get('/sliderHome', [
    // validatJWT
], sliderHome);

router.get('/similar/:id', [
    // validatJWT
], similar);

router.get('/last', [
    // validatJWT
], last);

router.get('/:id', [
    // validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isEventExist),
    validateFields
], eventsGetOne);

router.put('/:id', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isEventExist),
    check('category', 'The category is required').not().isEmpty(),
    check('name', 'The name is required').not().isEmpty(),
    validateFields,
    isActive
], eventsPut);

router.post('/', [
    validatJWT,
    check('category', 'The category is required').not().isEmpty(),
    check('name', 'The name is required').not().isEmpty(),
    check('start_date', 'The start_date is required').not().isEmpty(),
    check('start_time', 'The start_time is required').not().isEmpty(),
    check('end_date', 'The end_date is required').not().isEmpty(),
    check('end_time', 'The end_time is required').not().isEmpty(),
    check('name').custom(isUniqueName),
    validateFields,
    isActive
], eventsPost);

router.delete('/:id', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isEventExist),
    validateFields
], eventsDelete);

module.exports = router