const mongoose = require('mongoose');

const QuestTemplate = new mongoose.Schema({
    name: {
        type: String
    },
    type: {
        type: String
    },
    userId: {
        type: String
    },
    channelId: {
        type: String
    },
    successCounter: {
        type: Number
    }, 
    message: {
        type: String
    }
})

module.exports = mongoose.model('QuestTemplate', QuestTemplate);