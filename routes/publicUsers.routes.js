const { Router } = require('express');
const { getAll, post, put, getOne, remove } = require('../controllers/publicUsers.controllers');
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

router.get('/:registrantId', [
    validateAccessToken
], getOne);

router.delete('/:registrantId', [
    validateAccessToken
], remove);

module.exports = router