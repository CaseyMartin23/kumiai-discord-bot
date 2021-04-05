require("dotenv").config();
const QuestInProgress = require("../../models/QuestInProgress");
const QuestTemplate = require("../../models/QuestTemplate");
const AchievementTemplate = require("../../models/AchievementTemplate");
const AchievementInProgress = require("../../models/AchievementInProgress");
const User = require("../../models/User");
const rewardSysTypes = require("../../rewardSysTypes");
const { getUserRankId } = require("../../utils");

const handleQuests = async (message, user) => {
  let questTemplate = await QuestTemplate.findOne({
    type: rewardSysTypes.image,
  });

  let questInProgress = await QuestInProgress.findOne({
    discordId: message.author.id,
    type: rewardSysTypes.image,
  });
  if (!questInProgress) {
    questInProgress = await QuestInProgress.create({
      discordId: message.author.id,
      type: rewardSysTypes.image,
      questId: questTemplate.id,
      counter: 1,
    });
  } else {
    questInProgress.counter += 1;
  }

  if (
    questInProgress.counter === questTemplate.successCounter &&
    JSON.stringify(message.channel.id) ===
      JSON.stringify(questTemplate.channelId)
  ) {
    user.coins += questTemplate.points;
    user.points += questTemplate.points;
    user.completedQuests = [...user.completedQuests, questTemplate.id];
    await user.save();

    await questInProgress.remove();

    const member = await message.client.guilds.cache
      .get(process.env.GUILD_ID)
      .members.fetch(message);

    if (!member) {
      return console.log(
        `Couldn't find member for ${questTemplate.name} on discord.`
      );
    }

    await member.send(`You've completed the quest: ${questTemplate.name}`);
  } else {
    await questInProgress.save();
  }
};

const handleAchievement = async (message, user) => {
  let achievementTemplate = await AchievementTemplate.findOne({
    type: rewardSysTypes.image,
  });
  if (!user.completedAchievements.includes(achievementTemplate.id)) {
    let achievementInProgress = await AchievementInProgress.findOne({
      discordId: message.author.id,
      achievementId: achievementTemplate.id,
      type: rewardSysTypes.image,
    });

    if (!achievementInProgress) {
      achievementInProgress = await AchievementInProgress.create({
        discordId: message.author.id,
        achievementId: achievementTemplate.id,
        type: rewardSysTypes.image,
        counter: 1,
      });
    } else {
      achievementInProgress.counter += 1;
    }

    if (
      achievementInProgress.counter === achievementTemplate.successCounter &&
      JSON.stringify(message.channel.id) ===
        JSON.stringify(achievementTemplate.channelId)
    ) {
      user.coins += achievementTemplate.points;
      user.points += achievementTemplate.points;
      user.completedAchievements = [
        ...user.completedAchievements,
        achievementTemplate.id,
      ];
      await user.save();

      const member = await message.client.guilds.cache
        .get(process.env.GUILD_ID)
        .members.fetch(message);

      if (!member) {
        return console.log(
          `Couldn't find member for ${achievementTemplate.name} on discord.`
        );
      }

      await member.send(
        `You've completed the achievement: ${achievementTemplate.name}`
      );
      await achievementInProgress.remove();
    } else {
      await achievementInProgress.save();
    }
  }
};

module.exports = async (message) => {
  const attachementUrlArr = message.attachments
    .values()
    .next()
    .value.attachment.split("/");

  let attachementType = attachementUrlArr[attachementUrlArr.length - 1];
  attachementType = attachementType.split(".")[1];

  if (
    !attachementType.includes("png") &&
    !attachementType.includes("jpeg") &&
    !attachementType.includes("jpg")
  )
    return;

  const userId = message.author.id;
  let user = await User.findOne({
    discordId: userId,
  });

  if (!user) {
    console.log("user doesn't exist, creating new one for attachmenthandler");
    user = await User.create({
      discordId: userId,
      rankId: await getUserRankId(),
    });
  }

  handleQuests(message, user);

  handleAchievement(message, user);
};
