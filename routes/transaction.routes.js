const { Router } = require('express');
const { transactionStats, transactionCheck, transactionGet } = require('../controllers/transactions.controllers');
const { validateFields } = require('../middlewares/');
const { check } = require('express-validator');
const { validatJWT } = require('../middlewares/validate-jwt');

const router = Router();

router.get('/stats/get', [
    validatJWT,
], transactionStats);

router.post('/check', [
    validatJWT,
    check('transaction_id', "The field 'transaction_id' is required").not().isEmpty(),
    validateFields
], transactionCheck);

router.get('/', [
    validatJWT,
], transactionGet);


module.exports = router