const Rank = require("../models/Rank");
const { CMDAGRS, CMDNAMES, PREFIX } = require("./cmdKeys");

const handleCmdMessages = async (message) => {
  const [CMD_NAME, ...args] = message.content
    .trim()
    .substring(PREFIX.length)
    .split(/\s+/);

  if (CMD_NAME === CMDNAMES.RANK_CMD && args[0] === CMDAGRS.ADD) {
    if (
      !message.content.includes(CMDAGRS.RANK_NAME) ||
      !message.content.includes(CMDAGRS.RANK_POINTS) ||
      !message.content.includes(CMDAGRS.RANK_ID)
    ) {
      return message.channel.send(
        "Hmm you don't have everything for me to create a rank."
      );
    }

    var rankStartingIndex = message.content.indexOf(CMDAGRS.RANK_NAME);
    var idStartingIndex = message.content.indexOf(CMDAGRS.RANK_ID);
    var pointsStartingIndex = message.content.indexOf(CMDAGRS.RANK_POINTS);

    var rankName = message.content
      .substring(rankStartingIndex, idStartingIndex - 1)
      .replace(/\s+/g, " ")
      .trim();
    var id = message.content
      .substring(idStartingIndex, pointsStartingIndex - 1)
      .replace(/\s+/g, " ")
      .trim();
    var points = message.content
      .substring(pointsStartingIndex, message.content.length)
      .replace(/\s+/g, " ")
      .trim();

    // remove prefixes
    // r: rank name
    // i: id of the role
    // p: points required
    rankName = rankName.split(`${CMDAGRS.RANK_NAME} `)[1];
    id = id.split(`${CMDAGRS.RANK_ID} `)[1];
    points = points.split(`${CMDAGRS.RANK_POINTS} `)[1];

    console.log(`Rank name: ${rankName}, Id: ${id}, Points: ${points}`);

    if (!rankName || !id || !points)
      return message.channel.send("Hmm you provided an invalid command");

    var rank = await Rank.findOne({ rankName: rankName });
    if (rank) {
      rank.pointsRequired = points;
      rank.roleId = id;
      await rank.save();
      return message.channel.send(`${rankName} has been updated.`);
    }

    rank = await Rank.create({
      rankName: rankName,
      roleId: id,
      pointsRequired: points,
    });

    return message.channel.send(`${rankName} has been created.`);
  }

  if (CMD_NAME === CMDNAMES.RANK_CMD && args[0] === CMDAGRS.REMOVE) {
    var rawRankName = message.content.split(
      `${PREFIX}${CMDNAMES.RANK_CMD} ${CMDAGRS.REMOVE} `
    )[1];

    var rank = await Rank.findOne({ rankName: rawRankName });

    if (!rank) return message.channel.send(`That rank doesn't exist.`);

    await rank.remove();
    return message.channel.send(`${rawRankName} has been removed.`);
  }
};

module.exports = handleCmdMessages;
