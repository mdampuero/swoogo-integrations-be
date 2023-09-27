const { Schema, model } = require('mongoose');

const UserSchema = Schema({
    name: {
        type: String,
        required: [true, 'The name is required']
    },
    email: {
        type: String,
        required: [true, 'The email is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'The password is required']
    },
    img: {
        type: String
    },
    role: {
        type: String,
        required: true,
        enum: ['ADMIN_ROLE', 'USER_ROLE']
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    googleLogin: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
})

UserSchema.methods.toJSON = function () {
    const { __v, password, _id,... user} = this.toObject();
    user.id=_id
    return user;
}

module.exports = model('User', UserSchema);