const mongoose = require("mongoose");

const QuestInProgress = new mongoose.Schema({
  discordId: {
    type: String,
  },
  questId: {
    type: String,
  },
  type: {
    type: String,
  },
  time: {
    type: String,
  },
  counter: {
    type: Number,
  },
});

module.exports = mongoose.model("QuestInProgress", QuestInProgress);
