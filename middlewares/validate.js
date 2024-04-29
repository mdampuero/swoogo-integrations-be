const { validationResult } = require('express-validator');
const { logger } = require('../helpers/utils');
const validateFields = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        logger.warn(errors)
        return res.status(400).json({
            result: false,
            data: errors
        });
    }
    next();
}

module.exports = {
    validateFields
}