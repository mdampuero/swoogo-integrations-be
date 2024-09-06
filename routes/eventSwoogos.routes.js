const { Router } = require('express');
const { eventSwoogoGet } = require('../controllers/eventSwoogos.controllers');
const { validatJWT } = require('../middlewares/validate-jwt');

const router = Router();

router.get('/', [
    validatJWT,
], eventSwoogoGet);

<<<<<<< Updated upstream
=======
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
    check('registrantId', 'The registrantId is numeric').isNumeric(),
    check('sessionId', 'The sessionId is numeric').isNumeric(),
    validateFields
], eventSwoogoSessionPost);

>>>>>>> Stashed changes

module.exports = router