const { Router } = require('express');
const { transactionStats, transactionCheck, transactionGet } = require('../controllers/transactions.controllers');
const { validateFields } = require('../middlewares/');
const { check } = require('express-validator');
const router = Router();

router.get('/stats/get', [
], transactionStats);

router.post('/check', [
    check('transaction_id', "The field 'transaction_id' is required").not().isEmpty(),
    validateFields
], transactionCheck);

router.get('/', [
], transactionGet);


module.exports = router