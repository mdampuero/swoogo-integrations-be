const  validateFields = require('../middlewares/validate');
const  validateRoles = require('../middlewares/validate-role');
const  validatJWT  = require('../middlewares/validate-jwt');

module.exports = {
    ...validateFields,
    ...validateRoles,
    ...validatJWT
}