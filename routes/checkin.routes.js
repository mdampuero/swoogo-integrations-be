const { Router } = require('express');
const { byRutPost, byRegistrantIDsPost } = require('../controllers/checkins.controllers');
const { validatJWT } = require('../middlewares/validate-jwt');
const { validateFields } = require('../middlewares/validate');
const { check } = require('express-validator');
const { isRutValid } = require('../middlewares/checkin.middleware');
const router = Router();

router.post('/byRut', [
    check('sessionId', 'The sessionId is not number').isNumeric(),
    check('sessionId', 'The sessionId is required').not().isEmpty(),
    check('eventId', 'The eventId is not number').isNumeric(),
    check('eventId', 'The eventId is required').not().isEmpty(),
    check('rut', 'The rut is not number').isString(),
    check('rut', 'The rut is required').not().isEmpty(),
    check('rut').custom(isRutValid),
    validateFields
], byRutPost);

router.post('/byRegistrantIDs', [
    check('sessionId', 'The sessionId is not number').isNumeric(),
    check('sessionId', 'The sessionId is required').not().isEmpty(),
    check('eventId', 'The eventId is not number').isNumeric(),
    check('eventId', 'The eventId is required').not().isEmpty(),
    check('registrantIDs', 'The registrantIDs is required').not().isEmpty(),
    check('registrantIDs', 'The registrantIDs is required').isArray(),
    validateFields
], byRegistrantIDsPost);


module.exports = router