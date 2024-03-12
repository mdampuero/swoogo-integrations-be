const { Router } = require('express');
const { notificationsGet, notificationsPost, notificationsDelete, notificationsGetOne } = require('../controllers/notifications.controllers');
const { check } = require('express-validator');

const { validateFields } = require('../middlewares/validate');
const { validatJWT } = require('../middlewares/validate-jwt');
const { checkFieldByType, isNotificationTypeValid } = require('../middlewares/notification.middleware');

const router = Router();

router.get('/', [
   // validatJWT
], notificationsGet);

router.get('/:id', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    validateFields
], notificationsGetOne);

router.post('/', [
    //validatJWT,
    check('name', 'The name is required').not().isEmpty(),
    check('type').custom(isNotificationTypeValid),
    check('payload', 'The payload is required').not().isEmpty(),
    checkFieldByType,
    validateFields
], notificationsPost);

router.delete('/:id', [
    validatJWT,
    check('id', 'The id is not valid').isMongoId(),
    validateFields
], notificationsDelete);

module.exports = router