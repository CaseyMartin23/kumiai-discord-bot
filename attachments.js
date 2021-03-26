require("dotenv").config();
const QuestInProgress = require("./models/QuestInProgress");
const QuestTemplate = require("./models/QuestTemplate");
const User = require("./models/User");

module.exports = async (message) => {
  const userId = message.author.id.toString();

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

  let user = await User.findOne({
    discordId: userId,
  });

  if (!user) {
    user = await User.create({ discordId: userId });
    user.completedAchievements = [];
  }

  let questTemplate = await QuestTemplate.findOne({ type: "image" });
  let questInProgress = await QuestInProgress.findOne({
    discordId: userId,
    type: "image",
  });

  if (!questInProgress) {
    questInProgress = await QuestInProgress.create({
      discordId: userId,
      type: "image",
      counter: 1,
    });
  } else questInProgress.counter += 1;

  if (questInProgress.counter === questTemplate.successCounter) {
    await questInProgress.remove({});

    user.completedQuests = [...user.completedQuests, questTemplate.id];
    await user.save();

    const member = await message.client.guilds.cache
      .get(process.env.GUILD_ID)
      .members.fetch(message);

    if (!member)
      return console.log("Couldn't find member for image quest on discord.");
    await member.send(`You've completed the quest ${questTemplate.name}`);
  } else await questInProgress.save();
};
