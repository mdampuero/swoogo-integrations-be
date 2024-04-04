const { Schema, model } = require('mongoose');

const CategorySchema = Schema({
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
    },
    inHome: {
        type: Boolean,
        default: false
    },
    events: [],
    more: {
        type: Boolean,
        default: false
    },
})

CategorySchema.methods.toJSON = function () {
    const { __v, _id,... category} = this.toObject();
    category.id=_id
    return category;
}

module.exports = model('Category', CategorySchema);