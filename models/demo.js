const { Schema, model } = require('mongoose');

const DemoSchema = Schema({
    name: {
        type: String,
        required: [true, 'The name is required']
    },
    description: {
        type: String
    },
    isDelete: {
        type: Boolean,
        default: false
    }
})

DemoSchema.methods.toJSON = function () {
    const { __v, _id,... demo} = this.toObject();
    demo.id=_id
    return demo;
}

module.exports = model('Demo', DemoSchema);