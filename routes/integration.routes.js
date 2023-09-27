const { Router } = require('express');
const { integrationsGet, integrationsPut, integrationsPost, integrationsDelete, integrationsGetOne, integrationsStats } = require('../controllers/integrations.controllers');
const { check } = require('express-validator');

const { isIntegrationTypeValid, checkFieldByType, isIntegrationExist } = require('../middlewares/integration.middleware');
const { validateFields } = require('../middlewares/validate');

const router = Router();

router.get('/', [
], integrationsGet);

router.get('/:id', [
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isIntegrationExist),
    validateFields
], integrationsGetOne);

router.get('/stats/get', integrationsStats);

router.put('/:id', [
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isIntegrationExist),
    check('type').custom(isIntegrationTypeValid),
    checkFieldByType,
    validateFields
], integrationsPut);

router.post('/', [
    check('type').custom(isIntegrationTypeValid),
    checkFieldByType,
    validateFields
], integrationsPost);

router.delete('/:id', [
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isIntegrationExist),
    validateFields
], integrationsDelete);

module.exports = router