const mongoose = require('mongoose');

const QuestTemplate = new mongoose.Schema({
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

module.exports = mongoose.model('QuestTemplate', QuestTemplate);