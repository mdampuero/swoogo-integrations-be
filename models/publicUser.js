const { Schema, model } = require('mongoose');

const PublicUserSchema = Schema({
    name: {
        type: String,
        required: [true, 'The name is required']
    },
    isDelete: {
        type: Boolean,
        default: false
    }
})

PublicUserSchema.methods.toJSON = function () {
    const { __v, _id,... demo} = this.toObject();
    demo.id=_id
    return demo;
}

module.exports = model('PublicUser', PublicUserSchema);