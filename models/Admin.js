const mongoose = require('mongoose');

const Admin = new mongoose.Schema({
    username: {
        type: String
    },
    password: {
        type: String
    }
})

module.exports = mongoose.model('Admin', Admin);