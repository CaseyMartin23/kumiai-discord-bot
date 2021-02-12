const mongoose = require('mongoose');

const QuestInProgress = new mongoose.Schema({
    systemQuestId : {
        type: String
    },
    counter: {
        type: Number
    }
})

module.exports = mongoose.model('QuestInProgress', QuestInProgress);