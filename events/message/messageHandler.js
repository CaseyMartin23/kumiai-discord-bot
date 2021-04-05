require("dotenv").config({ path: "../../" });

const commandHandler = require("./commandHandler");
const attachmentsHandler = require("./attachmentsHandler");
const chatHandler = require("./chatHandler");
const prefix = process.env.PREFIX;

module.exports = async (message) => {
  try {
    if (message.author.bot) return;

    if (
      !message.content.startsWith(prefix) &&
      message.attachments &&
      message.attachments.values().next().value !== undefined
    ) {
      return attachmentsHandler(message);
    }

    if (message.content.startsWith(prefix) && message.attachments.size < 1) {
      return commandHandler(message);
    }

    chatHandler(message);
  } catch (err) {
    console.log(err.message);
  }
};
