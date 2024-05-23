const { Router } = require('express');
const { eventSwoogoGet, eventSwoogoSession, eventSwoogoSessionPost, eventSwoogoRegistrant, eventSwoogoSessionDownload } = require('../controllers/eventSwoogos.controllers');
const { validatJWT } = require('../middlewares/validate-jwt');
const { validateFields } = require('../middlewares/validate');
const { check } = require('express-validator');

const router = Router();

router.get('/', [
    validatJWT,
], eventSwoogoGet);

router.get('/:id/sessions', [
    validatJWT,
], eventSwoogoSession);

router.get('/:id/sessionsDownload/:integrationId', [
    // validatJWT,
], eventSwoogoSessionDownload);

router.get('/:id/registrants', [
    // validatJWT,
], eventSwoogoRegistrant);

router.post('/sessions', [
    check('sessionId', 'The sessionId is required').not().isEmpty(),
    check('registrantId', 'The sessionId is required').not().isEmpty(),
    validateFields
], eventSwoogoSessionPost);


module.exports = router