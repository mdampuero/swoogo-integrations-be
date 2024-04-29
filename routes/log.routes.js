const { Router } = require('express');
const { logsGet } = require('../controllers/logs.controllers');

const router = Router();

router.get('/', [
   // validatJWT
], logsGet);

module.exports = router