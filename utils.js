const Rank = require("./models/Rank");

const getUserRankId = async (user) => {
  const allRanks = await Rank.find();
  const sortedRanks = allRanks.sort((currentRank, previousRank) => {
    if (currentRank.pointsRequired < previousRank.pointsRequired) return -1;
    if (currentRank.pointsRequired > previousRank.pointsRequired) return 1;
    return 0;
  });

  if (user) {
    const userPoints = user.points;

    const [userRank] = sortedRanks.filter(
      (rank) =>
        userPoints >= rank.pointsRequired && userPoints <= rank.maxPoints
    );

    return userRank._id;
  } else {
    return sortedRanks[0]._id;
  }
};

module.exports = { getUserRankId };
