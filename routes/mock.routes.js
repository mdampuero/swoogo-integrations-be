const { Router } = require('express');
const { mockPost } = require('../controllers/mocks.controllers');
const { validatJWT } = require('../middlewares/validate-jwt');
const router = Router();

router.post('/', [
], mockPost);

module.exports = router