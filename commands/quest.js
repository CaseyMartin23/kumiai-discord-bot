const User = require("../models/User");
const QuestTemplate = require("../models/QuestTemplate");
const QuestInProgress = require("../models/QuestInProgress");
const rewardSysTypes = require("../rewardSysTypes");

module.exports = {
  name: "quest",
  actions: {
    progress: "-p",
    completed: "-c",
  },
  async userQuestProgress(message) {
    try {
      const userId = message.author.id;
      let outputString = `${message.author.username} quests progression:\n`;

      const userQuestsInProgress = await QuestInProgress.find({
        discordId: userId,
      });

      if (userQuestsInProgress.length > 0) {
        for (let index = 0; index < userQuestsInProgress.length; index++) {
          const userQuest = userQuestsInProgress[index];
          const quest = await QuestTemplate.findOne({
            _id: userQuest.questId,
          });

          switch (userQuest.type) {
            case rewardSysTypes.image:
              outputString += `\t- ${quest.name}: ${userQuest.counter}/${quest.successCounter} image(s)\n`;
              break;

            case rewardSysTypes.message:
              outputString += `\t- ${quest.name}: ${(
                userQuest.counter / 60
              ).toFixed(2)}/${(quest.successCounter / 60).toFixed(
                2
              )} minute(s)\n`;
              break;

            case rewardSysTypes.specificMessage:
              outputString += `\t- ${quest.name}: ${(
                userQuest.counter / 60
              ).toFixed(2)}/${(quest.successCounter / 60).toFixed(
                2
              )} minute(s)\n`;
              break;

            case rewardSysTypes.reaction:
              outputString += `\t- ${quest.name}: ${userQuest.counter}/${quest.successCounter} reaction(s)\n`;
              break;
          }
        }

        message.reply(outputString);
      } else {
        message.reply("You don't have any ongoing quests at the moment...");
      }
    } catch (err) {
      console.error(err);
    }
  },
  async userCompletedQuest(message) {
    try {
      const user = await User.findOne({ discordId: message.author.id });
      const usercompletedQuestIds = user.completedQuests.filter(
        (id, indx, array) => array.indexOf(id) === indx
      );

      let outputString = `${message.author.username} completed quests: \n`;

      if (usercompletedQuestIds.length > 0) {
        for (let index = 0; index < usercompletedQuestIds.length; index++) {
          const completedQuestId = usercompletedQuestIds[index];
          const quest = await QuestTemplate.findOne({ _id: completedQuestId });

          outputString += `\t- ${quest.name}\n`;
        }

        message.reply(outputString);
      } else {
        message.reply("You don't have any completed quests at the moment...");
      }
    } catch (err) {
      message.reply("You don't have any completed quests at the moment...");
      console.error(err.message);
    }
  },
  execute(message, args) {
    if (args[0] === this.actions.progress) {
      return this.userQuestProgress(message);
    }
    if (args[0] === this.actions.completed) {
      return this.userCompletedQuest(message);
    }

    message.reply("Please use the '#!help' command for more infomation");
  },
};
