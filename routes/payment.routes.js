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
const { existIntegration, existRegistrant } = require('../middlewares/payment.middleware');
const { existTransaction } = require('../middlewares/transaction.middleware');
const router = Router();

// Public
router.post('/create-order', [
    // check('item_currency', "The field 'item_currency' is required").not().isEmpty(),
    // check('registrant_id', "The field 'registrant_id' is required").not().isEmpty(),
    // existRegistrant,
    check('integration_id', "The field 'integration_id' is required").not().isEmpty(),
    existIntegration,
    validateFields
], createOrder);


router.post('/webhook', [], webhook);

router.get('/success', [], backSuccess);

router.get('/pending', [], backPending);

router.get('/failure', [], backFailure);

module.exports = router