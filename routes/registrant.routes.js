const { Router } = require('express');
const { registrantGet } = require('../controllers/registrants.controllers');

const router = Router();

router.get('/', [
], registrantGet);


module.exports = router