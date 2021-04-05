const User = require("../models/User");

module.exports = {
  name: "rewards",
  async getUserReward(message) {
    const discordId = message.author.id;
    try {
      let [user] = await User.find({ discordId });
      if (!user) {
        [user] = await User.create({ discordId });
      }

      message.reply(
        `
            Current point(s): ${user.points}
            Current coin(s):  ${user.coins}
          `
      );
    } catch (err) {
      console.log(err.message);
    }
  },
  execute(message, args) {
    this.getUserReward(message);
  },
};
