const { Router } = require('express');
const { mockPost } = require('../controllers/mocks.controllers');

const router = Router();

router.post('/', [
    
], mockPost);

module.exports = router