const { Router } =  require('express');
const { login,googleSignIn  } = require('../controllers/auth.controllers');
const { check } = require('express-validator');
const { validateFields } = require('../middlewares/validate');

const router = Router();

router.post('/login', [
    check('email','The name is required').not().isEmpty(),
    check('password','The password is required').not().isEmpty(),
    validateFields
],login);

router.post('/googleSignIn', [
    check('google_token','The google_token is required').not().isEmpty(),
    validateFields
],googleSignIn);

module.exports = router