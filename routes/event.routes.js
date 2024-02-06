const { Router } = require('express');
const { eventsGet, eventsPut, eventsPost, eventsDelete, eventsGetOne, sliderHome,last } = require('../controllers/events.controllers');
const { check } = require('express-validator');

const { validateFields } = require('../middlewares/validate');
const { validatJWT } = require('../middlewares/validate-jwt');
const { isUniqueName, isEventExist } = require('../middlewares/event.middleware');

const router = Router();

router.get('/', [
    validatJWT
], eventsGet);

router.get('/sliderHome', [
    // validatJWT
], sliderHome);

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
    validateFields
], eventsPut);

router.post('/', [
    validatJWT,
    check('category', 'The category is required').not().isEmpty(),
    check('name', 'The name is required').not().isEmpty(),
    check('name').custom(isUniqueName),
    validateFields
], eventsPost);

router.delete('/:id', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isEventExist),
    validateFields
], eventsDelete);

module.exports = router