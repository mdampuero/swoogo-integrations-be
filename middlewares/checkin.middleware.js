
const { isRut } = require('../helpers/utils');
const validator = require('validator');

const isRutValid = async (rut) => {
    const isRutConst = await isRut(rut);
    if(!isRutConst)
        throw new Error('The rut is not valid');
}

module.exports = {
    isRutValid
}