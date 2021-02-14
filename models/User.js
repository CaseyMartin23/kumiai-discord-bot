const mongoose = require("mongoose");

const User = new mongoose.Schema({
  discordId: {
    type: String,
  },
  points: {
    type: Number,
    default: 0
  },
  coins: {
    type: Number,
    default: 0
  },
  completedQuests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestTemplate',
    }
  ],
  completedAchievements: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement',
    }
  ],
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', User);