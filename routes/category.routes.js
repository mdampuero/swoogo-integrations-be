const { Router } = require('express');
const { categoriesGet, categoriesPut, categoriesPost, categoriesDelete, categoriesGetOne, home } = require('../controllers/categories.controllers');
const { check } = require('express-validator');

const { validateFields } = require('../middlewares/validate');
const { validatJWT } = require('../middlewares/validate-jwt');
const { isUniqueName, isCategoryExist } = require('../middlewares/category.middleware');

const router = Router();

router.get('/home', [
    // validatJWT
], home);

router.get('/', [
    validatJWT
], categoriesGet);

router.get('/:id', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isCategoryExist),
    validateFields
], categoriesGetOne);

router.put('/:id', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isCategoryExist),
    check('name', 'The name is required').not().isEmpty(),
    validateFields
], categoriesPut);

router.post('/', [
    validatJWT,
    check('name', 'The name is required').not().isEmpty(),
    check('name').custom(isUniqueName),
    validateFields
], categoriesPost);

router.delete('/:id', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isCategoryExist),
    validateFields
], categoriesDelete);

module.exports = router