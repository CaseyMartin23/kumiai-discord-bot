const mongoose = require("mongoose");

const Rank = new mongoose.Schema({
  rankName: {
    type: String,
  },
  pointsRequired: {
    type: Number,
  },
  maxPoints: {
    type: Number,
  },
  roleId: {
    type: String,
  },
});

module.exports = mongoose.model("Rank", Rank);
