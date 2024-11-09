const { Router } = require('express');
const { registrantGet, registrantPost } = require('../controllers/registrants.controllers');
const { validatJWT } = require('../middlewares/validate-jwt');

const router = Router();

router.get('/', [

], registrantGet);

router.post('/', [

], registrantPost);


module.exports = router