const { Router } = require('express');
const { integrationsGet,
    integrationsGetSession,
    integrationsPut, integrationsPost, integrationsDelete, integrationsGetOne, integrationsStats, integrationsTransactions,
    integrationsRegistrant,
    integrationsGetBySessionId } = require('../controllers/integrations.controllers');
const { check } = require('express-validator');
const { validatJWT } = require('../middlewares/validate-jwt');
const { isIntegrationTypeValid, checkFieldByType, isIntegrationExist } = require('../middlewares/integration.middleware');
const { validateFields } = require('../middlewares/validate');

const router = Router();

router.get('/', [
    validatJWT,
], integrationsGet);

router.get('/:id', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isIntegrationExist),
    validateFields
], integrationsGetOne);

router.get('/sessions/:id/:sessionId', [
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isIntegrationExist),
    validateFields
], integrationsGetSession);

router.get('/stats/get', [
    validatJWT,
], integrationsStats);

router.put('/:id', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isIntegrationExist),
    check('event_id', 'The Event is required').not().isEmpty(),
    check('type').custom(isIntegrationTypeValid),
    checkFieldByType,
    validateFields
], integrationsPut);

router.get('/:id/transactions/', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isIntegrationExist),
    validateFields
], integrationsTransactions);

router.post('/:id/registrants/:sessionId', [
    check('sessionId', 'The sessionId is required').not().isEmpty(),
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isIntegrationExist),
    check('registrantIDs', 'The registrantIDs is required').not().isEmpty(),
    check('registrantIDs', 'The registrantIDs is required').isArray(),
    validateFields
], integrationsRegistrant);

router.get('/getBySessionId/:sessionId', [
    //validateFields
], integrationsGetBySessionId);

router.post('/', [
    validatJWT,
    check('event_id', 'The Event is required').not().isEmpty(),
    check('type').custom(isIntegrationTypeValid),
    checkFieldByType,
    validateFields
], integrationsPost);

router.delete('/:id', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isIntegrationExist),
    validateFields
], integrationsDelete);

module.exports = router