const { Router } = require('express');
const { demosGet, demosPut, demosPost, demosDelete, demosGetOne, simulPay } = require('../controllers/demos.controllers');
const { check } = require('express-validator');

const { validateFields } = require('../middlewares/validate');
const { validatJWT } = require('../middlewares/validate-jwt');
const { isUniqueName, isDemoExist } = require('../middlewares/demo.middleware');

const router = Router();

router.get('/', [
   // validatJWT
], demosGet);

router.get('/:id', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isDemoExist),
    validateFields
], demosGetOne);

router.put('/:id', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isDemoExist),
    check('name', 'The name is required').not().isEmpty(),
    check('name').custom(isUniqueName),
    validateFields
], demosPut);

router.post('/', [
    validatJWT,
    check('name', 'The name is required').not().isEmpty(),
    check('name').custom(isUniqueName),
    validateFields
], demosPost);

router.post('/simulPay', [
    check('transaction_id', 'The transaction_id is required').not().isEmpty(),
    validateFields
], simulPay);

router.delete('/:id', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isDemoExist),
    validateFields
], demosDelete);

module.exports = router