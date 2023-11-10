const { Router } = require('express');
const { usersGet, usersPut, usersPost, usersDelete, usersGetOne,usersStats } = require('../controllers/users.controllers');
const { check } = require('express-validator');

const { validateFields,validateAdminRole, existRole, validatJWT  } = require('../middlewares/');

const { isRoleValid, isEmailExist, isUserExist } = require('../helpers/user-validators');
const router = Router();

router.get('/', [
    validatJWT,
    // validateAdminRole
], usersGet);

router.get('/:id', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isUserExist),
    validateFields
], usersGetOne);

router.get('/stats/get', [
    validatJWT,
], usersStats);

router.put('/:id', [
    validatJWT,
    // validateAdminRole,
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isUserExist),
    validateFields
], usersPut);

router.post('/', [
    validatJWT,
    // existRole('ADMIN_ROLE', 'USER_ROLE'),
    check('name', 'The name is required').not().isEmpty(),
    check('email', 'The email is invalid').isEmail(),
    check('password', 'The password is required').not().isEmpty(),
    // check('role').custom(isRoleValid),
    check('email').custom(isEmailExist),
    validateFields
], usersPost);

router.delete('/:id', [
    validatJWT,
    // validateAdminRole,
    // existRole('ADMIN_ROLE', 'USER_ROLE'),
    check('id', 'The id is not valid').isMongoId(),
    check('id').custom(isUserExist),
    validateFields,
], usersDelete);

module.exports = router