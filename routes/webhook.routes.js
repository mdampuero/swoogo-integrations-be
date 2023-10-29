const { Router } = require('express');
const { webhookPost } = require('../controllers/webhooks.controllers');

const router = Router();

router.post('/', [
], webhookPost);

module.exports = router