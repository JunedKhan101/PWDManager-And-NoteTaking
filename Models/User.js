const mongoose = require('mongoose');
const pwds = require('./pwds');
var passportLocalMongoose = require("passport-local-mongoose");

schema = mongoose.Schema;
const userschema = new schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    pwds: [
        {
            type: schema.Types.ObjectId,
            ref: 'pwds'
        }
    ],
    created_at: {
        type: Date,
        default: Date.now()
    },
    refreshtoken: {
        type: String
    },
    password: {
        type: String
    }
});
userschema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userschema);