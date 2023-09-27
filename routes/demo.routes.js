const { Router } = require('express');
const { demosGet, demosPut, demosPost, demosDelete, demosGetOne } = require('../controllers/demos.controllers');
const { check } = require('express-validator');

const { validateFields } = require('../middlewares/validate');
const { isUniqueName, isDemoExist } = require('../middlewares/demo.middleware');

const router = Router();

router.get('/', [
], demosGet);

router.get('/:id', [
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isDemoExist),
    validateFields
], demosGetOne);

router.put('/:id', [
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isDemoExist),
    check('name', 'The name is required').not().isEmpty(),
    check('name').custom(isUniqueName),
    validateFields
], demosPut);

router.post('/', [
    check('name', 'The name is required').not().isEmpty(),
    check('name').custom(isUniqueName),
    validateFields
], demosPost);

router.delete('/:id', [
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isDemoExist),
    validateFields
], demosDelete);

module.exports = router