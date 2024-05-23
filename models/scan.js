const { Schema, model } = require('mongoose');

const ScanSchema = Schema({
    registrantId: {
        type: Number
    },
    sessionId: {
        type: Number
    }
})

ScanSchema.methods.toJSON = function () {
    const { __v, _id, ...scan } = this.toObject();
    scan.id = _id
    return scan;
}

module.exports = model('Scan', ScanSchema);