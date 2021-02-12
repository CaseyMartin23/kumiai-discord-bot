const mongoose = require('mongoose');

const Achievement = new mongoose.Schema({
    name : {
        type: String
    },
    type: {
        type: String
    },
    channelId: {
        type: String
    },
    successCounter: {
        type: Number
    }
})

module.exports = mongoose.model('Achievement', Achievement);