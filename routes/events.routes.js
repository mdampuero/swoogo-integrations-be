const { Router } = require('express');
const { eventGet } = require('../controllers/events.controllers');

const router = Router();

router.get('/', [
], eventGet);


module.exports = router