const User = require("../models/User");
const AchievementTemplate = require("../models/AchievementTemplate");
const AchievementInProgress = require("../models/AchievementInProgress");
const rewardSysTypes = require("../rewardSysTypes");

module.exports = {
  name: "achievement",
  actions: {
    progress: "-p",
    completed: "-c",
  },
  async userAchievementProgress(message) {
    try {
      const userId = message.author.id;
      const userAchievements = await AchievementInProgress.find({
        discordId: userId,
      });

      let outputString = `${message.author.username} achievement progression:\n`;

      if (userAchievements.length > 0) {
        for (let index = 0; index < userAchievements.length; index++) {
          const userAchievement = userAchievements[index];
          const achievement = await AchievementTemplate.findOne({
            _id: userAchievement.achievementId,
          });

          switch (userAchievement.type) {
            case rewardSysTypes.image:
              outputString += `\t- ${achievement.name}: ${userAchievement.counter}/${achievement.successCounter} image(s)\n`;
              break;

            case rewardSysTypes.message:
              outputString += `\t- ${achievement.name}: ${(
                userAchievement.counter / 60
              ).toFixed(2)}/${(achievement.successCounter / 60).toFixed(
                2
              )} minute(s)\n`;
              break;

            case rewardSysTypes.specificMessage:
              outputString += `\t- ${achievement.name}: ${(
                userAchievement.counter / 60
              ).toFixed(2)}/${(achievement.successCounter / 60).toFixed(
                2
              )} minute(s)\n`;
              break;

            case rewardSysTypes.reaction:
              outputString += `\t- ${achievement.name}: ${userAchievement.counter}/${achievement.successCounter} reaction(s)\n`;
              break;
          }
        }

        message.reply(outputString);
      } else {
        message.reply(
          "You don't have any ongoing achievement at the moment..."
        );
      }
    } catch (err) {
      console.log(err.message);
      message.reply("You don't have any ongoing achievement at the moment...");
    }
  },
  async userAchievementCompleted(message) {
    try {
      const user = await User.findOne({ discordId: message.author.id });
      const usercompletedAchievementIds = user.completedAchievements;

      let outputString = `${message.author.username} completed achievements: \n`;

      if (usercompletedAchievementIds.length > 0) {
        for (
          let index = 0;
          index < usercompletedAchievementIds.length;
          index++
        ) {
          const completedAchievementId = usercompletedAchievementIds[index];
          const achievement = await AchievementTemplate.findOne({
            _id: completedAchievementId,
          });

          outputString += `\t- ${achievement.name}\n`;
        }

        message.reply(outputString);
      } else {
        message.reply(
          "You don't have any completed achievement at the moment..."
        );
      }
    } catch (err) {
      message.reply(
        "You don't have any completed achievement at the moment..."
      );
      console.error(err.message);
    }
  },
  execute(message, args) {
    if (args[0] === this.actions.progress) {
      return this.userAchievementProgress(message);
    }
    if (args[0] === this.actions.completed) {
      return this.userAchievementCompleted(message);
    }

    message.reply("Please use the '#!help' command for more infomation");
  },
};
