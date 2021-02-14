const mongoose = require('mongoose');

const Achievement = new mongoose.Schema({
    name: {
        type: String
    },
    type: {
        type: String
    },
    channelId: {
        type: String
    },
    message: {
        type: String
    },
    points: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('Achievement', Achievement);