const { Router } = require('express');
const { registrantGet } = require('../controllers/registrants.controllers');
const { validatJWT } = require('../middlewares/validate-jwt');

const router = Router();

router.get('/', [
    validatJWT,
], registrantGet);


module.exports = router