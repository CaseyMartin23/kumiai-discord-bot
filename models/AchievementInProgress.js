const mongoose = require("mongoose");

const AchievementInProgress = new mongoose.Schema({
  discordId: {
    type: String,
  },
  achievementId: {
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

module.exports = mongoose.model("AchievementInProgress", AchievementInProgress);
