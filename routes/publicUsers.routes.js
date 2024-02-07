const { Router } = require('express');
const { getAll, post, put } = require('../controllers/publicUsers.controllers');
const { validateAccessToken } = require('../middlewares/validate-accessToken');

const router = Router();

router.get('/', [
    validateAccessToken
], getAll);

router.post('/', [
    validateAccessToken
], post);

router.put('/:registrantId', [
    validateAccessToken
], put);

// router.delete('/:registrantId', [
//     validateAccessToken
// ], put);

module.exports = router