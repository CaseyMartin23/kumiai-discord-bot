const Rank = require("../models/Rank");
const { PREFIX } = require("../config.json");

module.exports = {
  name: "rank",
  actions: {
    add: {
      cmd_name: "-a",
      rank_name: "r:",
      rank_id: "i:",
      rank_points: "p:",
    },
    remove: "-r",
  },

  not_if_to_create_message:
    "Hmm you don't have everything for me to create a rank.",
  give_it_some_space:
    "Hmm you provided an invalid command, try giving the arguments more space.",
  updated_rank: "has been updated.",
  create_rank: "has been created.",
  rank_does_not_exists: "That rank doesn't exist.",
  rank_removed: "has been removed.",

  execute(message, args) {
    if (args[0] === this.actions.add.cmd_name) this.handleAddRank(message);
    if (args[0] === this.actions.remove) this.handleRemoveRank(message);
  },

  async handleAddRank(message) {
    if (
      !message.content.includes(this.actions.add.rank_name) ||
      !message.content.includes(this.actions.add.rank_id) ||
      !message.content.includes(this.actions.add.rank_points)
    ) {
      return message.channel.send(this.not_if_to_create_message);
    }

    const rankStartingIndex = message.content.indexOf(
      this.actions.add.rank_name
    );
    const idStartingIndex = message.content.indexOf(this.actions.add.rank_id);
    const pointsStartingIndex = message.content.indexOf(
      this.actions.add.rank_points
    );

    let rankName = message.content
      .substring(rankStartingIndex, idStartingIndex - 1)
      .replace(/\s+/g, " ")
      .trim();
    let id = message.content
      .substring(idStartingIndex, pointsStartingIndex - 1)
      .replace(/\s+/g, " ")
      .trim();
    let points = message.content
      .substring(pointsStartingIndex, message.content.length)
      .replace(/\s+/g, " ")
      .trim();

    // remove prefixes
    // r: rank name
    // i: id of the role
    // p: points required
    rankName = rankName.split(`${this.actions.add.rank_name} `)[1];
    id = id.split(`${this.actions.add.rank_id} `)[1];
    points = points.split(`${this.actions.add.rank_points} `)[1];

    console.log(`Rank name: ${rankName}, Id: ${id}, Points: ${points}`);

    if (!rankName || !id || !points)
      return message.channel.send(this.give_it_some_space);

    let rank = await Rank.findOne({ rankName: rankName });
    if (rank) {
      rank.pointsRequired = points;
      rank.roleId = id;
      await rank.save();
      return message.channel.send(`${rankName} ${this.updated_rank}`);
    }

    rank = await Rank.create({
      rankName: rankName,
      roleId: id,
      pointsRequired: points,
    });

    return message.channel.send(`${rankName} ${this.create_rank}`);
  },

  async handleRemoveRank(message) {
    let rawRankName = message.content.split(
      `${PREFIX}${this.name} ${this.actions.remove} `
    )[1];

    let rank = await Rank.findOne({ rankName: rawRankName });

    if (!rank) return message.channel.send(this.rank_does_not_exists);

    await rank.remove();
    return message.channel.send(`${rawRankName} ${this.rank_removed}`);
  },
};
