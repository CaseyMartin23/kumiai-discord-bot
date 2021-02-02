const mongoose = require("mongoose");

const User = new mongoose.Schema({
  discordId: {
    type: String,
  },
  points: {
    type: String,
    default: 0
  },
  coins: {
    type: Boolean,
    default: 0
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', User);