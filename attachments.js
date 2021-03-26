module.exports = (message) => {
    console.log("message-attachments->", message.attachments);
        const attachementUrlArr = message.attachments
          .values()
          .next()
          .value.attachment.split("/");

        console.log("attachementUrlArr->", attachementUrlArr);

        let attachementType = attachementUrlArr[attachementUrlArr.length - 1];
        attachementType = attachementType.split(".")[1];

        console.log("attachementType->", attachementType);

        if (
          !attachementType.includes("png") &&
          !attachementType.includes("jpeg") &&
          !attachementType.includes("jpg")
        )
          return;

        let user = await User.findOne({
          discordId: userId,
        });
        if (!user) user = await createDbUser(userId);

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

          const member = await client.guilds.cache
            .get(process.env.GUILD_ID)
            .members.fetch(message);

          if (!member)
            return console.log(
              "Couldn't find member for image quest on discord."
            );
          await member.send(`You've completed the quest ${questTemplate.name}`);
        } else await questInProgress.save();
 }