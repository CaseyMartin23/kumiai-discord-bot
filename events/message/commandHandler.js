require("dotenv").config({ path: "../../" });
const prefix = process.env.PREFIX;

module.exports = (message) => {
  const [command, ...args] = message.content
    .trim()
    .substring(prefix.length)
    .split(/\s+/);

  const commands = message.client.commands;

  if (!commands.has(command))
    return message.reply("Please use the '#!help' command for more infomation");
  try {
    commands.get(command).execute(message, args);
  } catch (err) {
    console.error(err);
    console.log("error executing said command!");
  }
};
