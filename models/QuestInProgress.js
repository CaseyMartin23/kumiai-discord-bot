const mongoose = require('mongoose');

const QuestInProgress = new mongoose.Schema({
    discordId: {
        type: String
    },
    type : {
        type: String
    },
    counter: {
        type: Number
    }
})

module.exports = mongoose.model('QuestInProgress', QuestInProgress);