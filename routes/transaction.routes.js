const { Router } = require('express');
const { transactionStats } = require('../controllers/transactions.controllers');
const router = Router();

router.get('/stats/get', [
], transactionStats);


module.exports = router