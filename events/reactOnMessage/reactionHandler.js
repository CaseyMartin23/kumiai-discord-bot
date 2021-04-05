const QuestTemplate = require("../../models/QuestTemplate");
const QuestInProgress = require("../../models/QuestInProgress");
const AchievementInProgress = require("../../models/AchievementInProgress");
const AchievementTemplate = require("../../models/AchievementTemplate");
const User = require("../../models/User");
const rewardSysTypes = require("../../rewardSysTypes");
const { getUserRankId } = require("../../utils");

module.exports = async (reaction, userThatReacted) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      console.error("Something went wrong when fetching the message: ", error);
      return;
    }
  }

  const userId = userThatReacted.id;

  let user = await User.findOne({ discordId: userId });
  console.log("reactionhandler-user->", user);
  if (!user) {
    console.log("creating new user...");
    user = await User.create({
      discordId: userId,
      rankId: await getUserRankId(),
    });
  }

  const reactionAchievement = await AchievementTemplate.findOne({
    type: rewardSysTypes.reaction,
  });

  const reactionQuest = await QuestTemplate.findOne({
    type: rewardSysTypes.reaction,
  });

  if (reactionQuest.reactionName === reaction.emoji.name) {
    let reactQuestInProgress = await QuestInProgress.findOne({
      discordId: userId,
      questId: reactionQuest.id,
      type: rewardSysTypes.reaction,
    });

    if (!reactQuestInProgress) {
      reactQuestInProgress = await QuestInProgress.create({
        discordId: userId,
        type: rewardSysTypes.reaction,
        counter: 1,
        questId: reactionQuest.id,
      });
    } else if (
      reactQuestInProgress &&
      reactionQuest.successCounter !== reactQuestInProgress.counter
    ) {
      reactQuestInProgress.counter += 1;
      reactQuestInProgress.save();
    }

    if (
      reaction.message.author.id !== userId &&
      reactQuestInProgress.counter === reactionQuest.successCounter
    ) {
      user.coins += reactionQuest.points;
      user.points += reactionQuest.points;
      user.completedQuests.push(reactionQuest.id);
      await user.save();

      console.log("user-completedQuests->", user.completedQuests);

      const member = await reaction.message.client.guilds.cache
        .get(process.env.GUILD_ID)
        .members.fetch(userThatReacted);

      if (!member) {
        return console.error(
          `Couldn't find member for ${reactionQuest.name} on discord.`
        );
      }

      await reactQuestInProgress.remove({});
      await member.send(`You've completed the quest: ${reactionQuest.name}`);
    }
  } else if (
    reactionAchievement.reactionName === reaction.emoji.name &&
    !user.completedAchievements.includes(reactionAchievement.id)
  ) {
    let reactAchievementInProgress = await AchievementInProgress.findOne({
      discordId: userId,
      achievementId: reactionAchievement.id,
      type: rewardSysTypes.reaction,
    });

    console.log("reactAchievementInProgress->", reactAchievementInProgress);

    if (!reactAchievementInProgress) {
      console.log("creating new achievement progress...");
      console.log("achievement-id->", reactionAchievement.id);
      console.log("userId->", userId);

      reactAchievementInProgress = await AchievementInProgress.create({
        achievementId: reactionAchievement.id,
        discordId: userId,
        type: rewardSysTypes.reaction,
        counter: 1,
      });
    } else if (
      reactionAchievement.successCounter !==
        reactAchievementInProgress.counter &&
      reactAchievementInProgress
    ) {
      console.log("achievement already exists, incrementing instead");
      reactAchievementInProgress.counter += 1;
      reactAchievementInProgress.save();
    }

    if (
      reactAchievementInProgress.counter === reactionAchievement.successCounter
    ) {
      user.coins += reactionAchievement.points;
      user.points += reactionAchievement.points;
      user.completedAchievements = [
        ...user.completedAchievements,
        reactionAchievement.id,
      ];
      user.save();

      const member = await reaction.message.client.guilds.cache
        .get(process.env.GUILD_ID)
        .members.fetch(userThatReacted.id);

      if (!member) {
        return console.error(
          `Couldn't find member for ${reactionAchievement.name} on discord.`
        );
      }

      await reactAchievementInProgress.remove({});
      await member.send(
        `You've completed the achievement: ${reactionAchievement.name}`
      );
    }
  }
};
