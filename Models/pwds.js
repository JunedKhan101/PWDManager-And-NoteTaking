const mongoose = require('mongoose');

schema = mongoose.Schema;
pwds = new schema({
    relateduserid: {
        type: schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Pwds', pwds);