const fs = require("fs");
const mongoose = require("mongoose");

const AchievementTemplate = require("./models/AchievementTemplate");
const QuestTemplate = require("./models/QuestTemplate");
const Admin = require("./models/Admin");
const Rank = require("./models/Rank");

require("dotenv").config();
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
});

//read file synchronously (till read completion)
const achievements = JSON.parse(
  fs.readFileSync(`${__dirname}/data/achievementSeeds.json`)
);
const quests = JSON.parse(fs.readFileSync(`${__dirname}/data/questSeeds.json`));
const admin = JSON.parse(fs.readFileSync(`${__dirname}/data/admin.json`));
const rank = JSON.parse(fs.readFileSync(`${__dirname}/data/rankSeeds.json`));

const importData = async () => {
  try {
    await AchievementTemplate.deleteMany();
    await AchievementTemplate.create(achievements);

    await QuestTemplate.deleteMany();
    await QuestTemplate.create(quests);

    await Admin.deleteMany();
    await Admin.create(admin);

    await Rank.deleteMany();
    await Rank.create(rank);

    console.log("Dummy data created");
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

importData();
