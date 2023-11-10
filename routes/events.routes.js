const { Router } = require('express');
const { eventGet } = require('../controllers/events.controllers');
const { validatJWT } = require('../middlewares/validate-jwt');

const router = Router();

router.get('/', [
    validatJWT,
], eventGet);


module.exports = router