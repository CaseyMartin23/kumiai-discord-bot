module.exports = {
  name: "help",
  execute(message, args) {
    message.reply(
      `Available commands:
        - #!quest:
              -p: Displays your quests progression
              -c: Displays your quests completed

        - #!achievement:
              -p: Displays your achievements progression
              -c: Displays your achievements completed

        - #!rank: Displays your current rank

        - #!rewards: Displays your Ai points and Ai coins
      `
    );
  },
};
