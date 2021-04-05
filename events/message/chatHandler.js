const differenceInSeconds = require("date-fns/differenceInSeconds");
const getYear = require("date-fns/getYear");
const getMonth = require("date-fns/getMonth");
const getDaysInMonth = require("date-fns/getDaysInMonth");
const getHours = require("date-fns/getHours");

const QuestInProgress = require("../../models/QuestInProgress");
const QuestTemplate = require("../../models/QuestTemplate");
const AchievementInProgress = require("../../models/AchievementInProgress");
const AchievementTemplate = require("../../models/AchievementTemplate");
const User = require("../../models/User");
const rewardSysTypes = require("../../rewardSysTypes");
const { getUserRankId } = require("../../utils");

const isSameHour = (firstDate, secondDate) => {
  const firstDateYear = getYear(firstDate);
  const firstDateMonth = getMonth(firstDate);
  const firstDateDay = getDaysInMonth(firstDate);
  const firstDateHours = getHours(firstDate);

  const secondDateYear = getYear(secondDate);
  const secondDateMonth = getMonth(secondDate);
  const secondDateDay = getDaysInMonth(secondDate);
  const secondDateHours = getHours(secondDate);

  return (
    firstDateYear === secondDateYear &&
    firstDateMonth === secondDateMonth &&
    firstDateDay === secondDateDay &&
    firstDateHours === secondDateHours
  );
};

const handleQuests = async (message, user) => {
  const discordId = message.author.id;

  let messageQuest = await QuestTemplate.findOne({
    type: rewardSysTypes.message,
  });

  let specificMessageQuest = await QuestTemplate.findOne({
    type: rewardSysTypes.specificMessage,
  });

  const messageDate = new Date(message.createdAt);

  if (message.channel.id === specificMessageQuest.channelId) {
    let specificMessageQuestInProgress = await QuestInProgress.findOne({
      questId: specificMessageQuest.id,
      type: rewardSysTypes.specificMessage,
      discordId,
    });

    if (!specificMessageQuestInProgress) {
      specificMessageQuestInProgress = await QuestInProgress.create({
        questId: specificMessageQuest._id,
        type: rewardSysTypes.specificMessage,
        time: messageDate,
        discordId,
      });
    }

    const specificMessageQuestTime = new Date(
      specificMessageQuestInProgress.time
    );

    if (isSameHour(messageDate, specificMessageQuestTime)) {
      const specificDiffInSeconds = differenceInSeconds(
        messageDate,
        new Date(specificMessageQuestTime)
      );

      specificMessageQuestInProgress.counter = specificDiffInSeconds;
      specificMessageQuestInProgress.save();

      if (
        specificMessageQuestInProgress.counter >=
        specificMessageQuest.successCounter
      ) {
        user.points += specificMessageQuest.points;
        user.coins += specificMessageQuest.points;
        user.completedQuests = [
          ...user.completedQuests,
          specificMessageQuest.id,
        ];
        user.save();

        const member = await message.client.guilds.cache
          .get(process.env.GUILD_ID)
          .members.fetch(message);

        if (!member) {
          return console.log(
            `Couldn't find member for ${specificMessageQuest.name} quest on discord.`
          );
        }

        await member.send(
          `You've completed the quest: ${specificMessageQuest.name}`
        );

        await specificMessageQuestInProgress.remove({});
      }
    }
  } else {
    let messageQuestInProgress = await QuestInProgress.findOne({
      questId: messageQuest._id,
      type: rewardSysTypes.message,
      discordId,
    });
    if (!messageQuestInProgress) {
      messageQuestInProgress = await QuestInProgress.create({
        questId: messageQuest._id,
        type: rewardSysTypes.message,
        time: message,
        discordId,
      });
    }

    const messageQuestTime = new Date(messageQuestInProgress.time);

    if (isSameHour(messageDate, messageQuestTime)) {
      const messageDiffInSeconds = differenceInSeconds(
        messageDate,
        new Date(messageQuestTime)
      );

      messageQuestInProgress.counter = messageDiffInSeconds;
      messageQuestInProgress.save();

      if (messageQuestInProgress.counter >= messageQuest.successCounter) {
        user.points += messageQuest.points;
        user.coins += messageQuest.points;
        user.completedQuests = [...user.completedQuests, messageQuest.id];
        user.save();

        const member = await message.client.guilds.cache
          .get(process.env.GUILD_ID)
          .members.fetch(message);

        if (!member) {
          return console.log(
            `Couldn't find member for ${messageQuest.name} quest on discord.`
          );
        }

        await member.send(`You've completed the quest: ${messageQuest.name}`);

        await messageQuestInProgress.remove({});
      }
    }
  }
};

const handleAchievements = async (message, user) => {
  const discordId = message.author.id;

  let messageAchievement = await AchievementTemplate.findOne({
    type: rewardSysTypes.message,
  });

  let specificMessageAchievement = await AchievementTemplate.findOne({
    type: rewardSysTypes.specificMessage,
  });

  const messageDate = new Date(message.createdAt);

  if (
    message.channel.id === specificMessageAchievement.channelId &&
    !user.completedAchievements.includes(specificMessageAchievement.id)
  ) {
    let specificMessageAchievementInProgress = await AchievementInProgress.findOne(
      {
        achievementId: specificMessageAchievement.id,
        type: rewardSysTypes.specificMessage,
        discordId,
      }
    );

    if (!specificMessageAchievementInProgress) {
      specificMessageAchievementInProgress = await AchievementInProgress.create(
        {
          achievementId: specificMessageAchievement.id,
          type: rewardSysTypes.specificMessage,
          time: messageDate,
          discordId,
        }
      );
    }

    const specificMessageAchievementTime = new Date(
      specificMessageAchievementInProgress.time
    );

    if (isSameHour(messageDate, specificMessageAchievementTime)) {
      const specificDiffInSeconds = differenceInSeconds(
        messageDate,
        new Date(specificMessageAchievementTime)
      );

      specificMessageAchievementInProgress.counter = specificDiffInSeconds;
      specificMessageAchievementInProgress.save();

      if (
        specificMessageAchievementInProgress.counter >=
        specificMessageAchievement.successCounter
      ) {
        user.points += specificMessageAchievement.points;
        user.coins += specificMessageAchievement.points;
        user.completedAchievements = [
          ...user.completedAchievements,
          specificMessageAchievement.id,
        ];

        const member = await message.client.guilds.cache
          .get(process.env.GUILD_ID)
          .members.fetch(message);

        if (!member) {
          return console.log(
            `Couldn't find member for ${specificMessageAchievement.name} achievement on discord.`
          );
        }

        await member.send(
          `You've completed the achievement: ${specificMessageAchievement.name}`
        );

        await specificMessageAchievementInProgress.remove({});
        user.save();
      }
    }
  } else {
    if (!user.completedAchievements.includes(messageAchievement.id)) {
      let messageAchievementInProgress = await AchievementInProgress.findOne({
        questId: messageAchievement._id,
        type: rewardSysTypes.message,
        discordId: discordId,
      });
      if (!messageAchievementInProgress) {
        messageAchievementInProgress = await AchievementInProgress.create({
          questId: messageAchievement._id,
          type: rewardSysTypes.message,
          time: message,
          discordId: discordId,
        });
      }

      const messageAchievementTime = new Date(
        messageAchievementInProgress.time
      );

      if (isSameHour(messageDate, messageAchievementTime)) {
        const messageDiffInSeconds = differenceInSeconds(
          messageDate,
          new Date(messageAchievementTime)
        );

        messageAchievementInProgress.counter = messageDiffInSeconds;
        messageAchievementInProgress.save();

        if (
          messageAchievementInProgress.counter >=
          messageAchievement.successCounter
        ) {
          user.points += messageAchievement.points;
          user.coins += messageAchievement.points;
          user.completedAchievements = [
            ...user.completedAchievements,
            messageAchievement.id,
          ];
          user.save();

          const member = await message.client.guilds.cache
            .get(process.env.GUILD_ID)
            .members.fetch(message);

          if (!member) {
            return console.log(
              `Couldn't find member for ${messageAchievement.name} quest on discord.`
            );
          }

          await member.send(
            `You've completed the quest: ${messageAchievement.name}`
          );

          await messageAchievementInProgress.remove({});
        }
      }
    }
  }
};

module.exports = async (message) => {
  const discordId = message.author.id;

  let user = await User.findOne({ discordId });
  if (!user) {
    user = await User.create({ discordId, rankId: await getUserRankId() });
  }

  handleQuests(message, user);

  handleAchievements(message, user);
};
