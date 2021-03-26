require("dotenv").config();
const { Client } = require("discord.js");
var CronJob = require("cron").CronJob;
const Rank = require("./models/Rank");
const User = require("./models/User");
const Achievement = require("./models/Achievement");
const QuestTemplate = require("./models/QuestTemplate");
const QuestInProgress = require("./models/QuestInProgress");
const ConnectMDB = require("./config/db");
const { PREFIX } = require("./cmd/cmdKeys");
const handleCmdMessages = require("./cmd/cmdMessages");
const client = new Client({
  partials: ["MESSAGE", "REACTION"],
});

// mognodb config
ConnectMDB();

client.on("ready", () => {
  console.log(`${client.user.tag} has logged in.`);
});

const createDbUser = async (userId) => {
  const user = await User.create({ discordId: userId });
  user.completedAchievements = [];
  return user;
};

// passive points for chatting
var chatAuthorIds = [];
// passive points for streaming
var streamAuthorIds = {};
// passive recording for chatInChannel quest
var chatInChannel = {};

client.on("message", async (message) => {
  try {
    if (message.author.bot) return;
    if (message.content.startsWith(PREFIX)) {
      handleCmdMessages(message);
    } else {
      if (
        message.attachments &&
        message.attachments.values().next().value !== undefined
      ) {
        var attachementUrlArr = message.attachments
          .values()
          .next()
          .value.attachment.split("/");
        var attachementType = attachementUrlArr[attachementUrlArr.length - 1];
        attachementType = attachementType.substr(attachementType.length - 5);
        if (
          !attachementType.includes(".png") &&
          !attachementType.includes(".jpeg") &&
          !attachementType.includes(".jpg")
        )
          return;

        var user = await User.findOne({
          discordId: message.author.id.toString(),
        });
        if (!user) user = await createDbUser(message.author.id.toString());

        var questTemplate = await QuestTemplate.findOne({ type: "image" });
        var questInProgress = await QuestInProgress.findOne({
          discordId: message.author.id.toString(),
          type: "image",
        });
        if (!questInProgress)
          questInProgress = await QuestInProgress.create({
            discordId: message.author.id.toString(),
            type: "image",
            counter: 1,
          });
        else questInProgress.counter = questInProgress.counter + 1;
        if (questInProgress.counter === questTemplate.successCounter) {
          await questInProgress.remove();
          user.completedQuests = [...user.completedQuests, questTemplate.id];
          await user.save();

          const member = await client.guilds.cache
            .get(process.env.GUILD_ID)
            .members.fetch(message);
          if (!member)
            return console.log(
              "Couln't find member for image quest on discord."
            );
          await member.send(`You've completed the quest ${questTemplate.name}`);
        } else await questInProgress.save();
      }

      var isSpecific = await Achievement.findOne({
        message: message.content,
        channelId: message.channel.id.toString(),
      });
      var quest = await QuestTemplate.findOne({
        channelId: message.channel.id.toString(),
        type: "message-in-channel",
      });

      if (isSpecific) {
        // ACHIEVEMENT: User sends a specific message in a specific channel
        var user = await User.findOne({
          discordId: message.author.id.toString(),
        });
        if (!user) user = await createDbUser(message.author.id.toString());
        user.completedAchievements = [
          ...user.completedAchievements,
          isSpecific.id,
        ];
        user.points = user.points + isSpecific.points;
        user.coins = user.coins + isSpecific.points;
        await user.save();
        const member = await client.guilds.cache
          .get(process.env.GUILD_ID)
          .members.fetch(message.author.id.toString());
        if (!member) return;
        await member.send("Specific channel achievement unlocked.");
      }

      // chat in channel quest
      if (message.channel.id.toString() === process.env.chatInChannelQuest) {
        var quest = await QuestTemplate.findOne({
          channelId: process.env.chatInChannelQuest,
          type: "message-in-channel",
        });
        if (!quest)
          return console.log("Couldn't find message in channel quest.");

        var messageAtInMinutes = Math.round(
          message.createdTimestamp / parseInt(quest.message)
        );
        if (!chatInChannel[message.author.id.toString()])
          chatInChannel[message.author.id.toString()] = [messageAtInSeconds];
        else if (chatInChannel[message.author.id.toString()].isArray()) {
          // if quest not completed yet
          var intervalExists = chatInChannel[message.author.id.toString()].find(
            (t) => t === messageAtInMinutes
          );
          if (!intervalExists)
            chatInChannel[message.author.id.toString()] = [
              ...chatInChannel[message.author.id.toString()],
              messageAtInMinutes,
            ];
        }
      }

      // add author id to array here for passive points (every min)
      var authorExists = chatAuthorIds.find(
        (a) => a === message.author.id.toString()
      );
      if (authorExists) return;
      return chatAuthorIds.push(message.author.id.toString());
    }
  } catch (err) {
    console.log(err.message);
  }
});

client.on("raw", async (packet) => {
  if (packet.t === "VOICE_STATE_UPDATE") {
    if (!streamAuthorIds[packet.d.user_id] && !packet.d.self_stream) {
      // user just enters channel
      // ACHIEVEMENT: User joinds vc for the first time.
      const achievement = await Achievement.findOne({ type: "vc" });
      if (!achievement) return;
      var user = await User.findOne({ discordId: packet.d.user_id });
      if (!user) user = await createDbUser(packet.d.user_id);

      var achievementExists = user.completedAchievements.find(
        (a) => a.toString() === achievement.id.toString()
      );
      if (achievementExists) return;

      user.completedAchievements = [
        ...user.completedAchievements,
        achievement.id,
      ];
      await user.save();
      const member = await client.guilds.cache
        .get(process.env.GUILD_ID)
        .members.fetch(packet.d.user_id);
      if (!member) return;
      await member.send("Voice channel achievement unlocked.");
    } else if (
      (streamAuthorIds[packet.d.user_id] === false ||
        !streamAuthorIds[packet.d.user_id]) &&
      packet.d.self_stream === true
    )
      streamAuthorIds[packet.d.user_id] = true; // if the user starts streaming
    console.log(streamAuthorIds);
  }
});

client.login(process.env.BOT_TOKEN).then(() => {
  // run cron job to assign points and empty array
  new CronJob(
    "*/10 * * * * *",
    async function () {
      console.log("Granting points to users who've been chatting...");
      var chatAuthorIdsCopy = [...chatAuthorIds];
      chatAuthorIds = [];

      async function grantChatPoints() {
        for (var a of chatAuthorIdsCopy) {
          var statIncrease = Math.floor(Math.random() * (5 - 1 + 1)) + 1; // Random number between 1 (inclusive) and 5 (inclusive)
          var user = await User.findOne({ discordId: a });
          if (!user)
            user = await User.create({
              discordId: a,
              points: statIncrease,
              coins: statIncrease,
            });
          else {
            user.points = user.points + statIncrease;
            user.coins = user.coins + statIncrease;
            await user.save();
          }
        }
      }

      await grantChatPoints();
    },
    null,
    true,
    "America/Toronto"
  );

  new CronJob(
    "*/10 * * * * *",
    async function () {
      console.log("Granting points to users who've been streaming...");
      var streamAuthorIdsCopy = { ...streamAuthorIds };
      streamAuthorIds = {};

      async function grantStreamPoints() {
        for (var key of Object.keys(streamAuthorIdsCopy)) {
          if (streamAuthorIdsCopy[key] === true) {
            var user = await User.findOne({ discordId: key });
            if (!user)
              user = await User.create({
                discordId: a,
                points: 100,
                coins: 100,
              });
            else {
              user.points = user.points + 100;
              user.coins = user.coins + 100;
              await user.save();
            }
          }
        }
      }

      await grantStreamPoints();
    },
    null,
    true,
    "America/Toronto"
  );

  new CronJob(
    "*/10 * * * * *",
    async function () {
      console.log(
        "Checking quest completion for users who've been chatting in a specific chanenl..."
      );
      var chatInChannelCopy = { ...chatInChannel };
      chatInChannel = {};

      // async function grantStreamPoints () {
      //   for (var key of Object.keys(streamAuthorIdsCopy)) {
      //     if (streamAuthorIdsCopy[key] === true) {
      //       var user = await User.findOne({ discordId: key });
      //       if (!user) user = await User.create({ discordId: a, points: 100 });
      //       else {
      //         user.points = user.points + 100;
      //         user.coins = user.coins + 100;
      //         await user.save();
      //       }
      //     }
      //   }
      // }

      // await grantStreamPoints();
    },
    null,
    true,
    "America/Toronto"
  );

  // new CronJob('*/5 * * * * *', async function() {
  //   console.log("Deciding roles based on user db rank...");

  //   async function grantRolesFromPoints () {
  //     console.log(process.env.GUILD_ID);
  //     var ranks = await Rank.find();
  //     var members = await client.guilds.cache.get(process.env.GUILD_ID).members.fetch()
  //     console.log(members)

  //     for (var m of members) {
  //       var user = await User.findOne({ discordId: m[0] });
  //       if (!user) {
  //         user = await User.create({ discordId: m[0] });
  //         // assign role of random kum

  //       }
  //       else {
  //         ranks.sort((a, b) => a.points - b.points);

  //         for (var i = 0; i < ranks.length; i++) {
  //           if (ranks[i] >= user.points && ranks[i + 1] <= user.points) console.log(ranks[i]);
  //         }
  //       }
  //       console.log(m[1]._roles); // discord roles
  //       console.log(m[0]); // discord member id
  //     }
  //   }

  //   await grantRolesFromPoints();

  // }, null, true, 'America/Toronto');

  new CronJob(
    "*/10 * * * * *",
    async function () {
      console.log(
        "Checking to see if any users have completed all of their quests..."
      );

      async function grantAchievementFromQuests() {
        console.log(process.env.GUILD_ID);
        var achievement = await Achievement.findOne({ type: "all" });
        if (!achievement)
          return console.log("Couldn't find all quests completed achievement.");

        var quests = await QuestTemplate.find();
        if (!quests || quests.length === 0) return console.log("No quests.");

        var users = await User.find();
        if (!users || users.length === 0) return console.log("No users.");

        for (var u of users) {
          if (
            u &&
            u.completedQuests &&
            u.completedQuests.length === quests.length
          ) {
            var hasAchievement = u.completedAchievements.find(
              (a) => a.toString() === achievement.id.toString()
            );
            if (!hasAchievement) {
              u.completedAchievements = [
                ...u.completedAchievements,
                achievement.id,
              ];
              await u.save();
              console.log(u.id + "has completed all the quests.");
            }
          }
        }
      }

      await grantAchievementFromQuests();
    },
    null,
    true,
    "America/Toronto"
  );
});
