const mongoose = require("mongoose");

const Rank = new mongoose.Schema({
  rankName: {
    type: String,
  },
  pointsRequired: {
    type: String,
    default: 0
  },
  roleId: {
    type: Boolean,
    default: 0
  }
});

module.exports = mongoose.model('Rank', Rank);