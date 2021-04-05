const mongoose = require("mongoose");

const AchievementTemplate = new mongoose.Schema({
  name: {
    type: String,
  },
  type: {
    type: String,
  },
  userId: {
    type: String,
  },
  channelId: {
    type: String,
  },
  reactionName: {
    type: String,
  },
  successCounter: {
    type: Number,
  },
  coins: {
    type: Number,
  },
  points: {
    type: Number,
  },
});

module.exports = mongoose.model("AchievementTemplate", AchievementTemplate);
