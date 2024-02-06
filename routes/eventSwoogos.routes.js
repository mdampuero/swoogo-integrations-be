const { Router } = require('express');
const { eventSwoogoGet } = require('../controllers/eventSwoogos.controllers');
const { validatJWT } = require('../middlewares/validate-jwt');

const router = Router();

router.get('/', [
    validatJWT,
], eventSwoogoGet);


module.exports = router