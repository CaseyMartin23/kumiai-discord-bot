const User = require("../models/User");
const Rank = require("../models/Rank");
const { getUserRankId } = require("../utils");

module.exports = {
  name: "rank",
  async getUserRank(message) {
    const discordId = message.author.id;
    try {
      let user = await User.findOne({ discordId });
      if (!user) {
        user = await User.create({ discordId, rankId: await getUserRankId() });
      }

      const userRankId = await getUserRankId(user);

      console.log("userRankId->", userRankId);

      const userRank = await Rank.findOne({ _id: userRankId });

      console.log("userRank->", userRank);

      message.reply(
        `Your current rank is:
          ${userRank.rankName}
        `
      );
    } catch (err) {
      console.error(err.message);
    }
  },
  execute(message, args) {
    this.getUserRank(message);
  },
};
