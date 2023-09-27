const { Router } = require('express');
const { 
    createOrder, 
    webhook, 
    backFailure,
    backPending,
    backSuccess 
} = require('../controllers/payment.controllers');
const { check } = require('express-validator');

const { validateFields } = require('../middlewares/');

const router = Router();

// Public
router.post('/create-order', [
    check('integration_id', "The field 'integration_id' is required").not().isEmpty(),
    validateFields
], createOrder);

router.post('/webhook', [], webhook);

router.get('/success', [], backSuccess);

router.get('/pending', [], backPending);

router.get('/failure', [], backFailure);

module.exports = router