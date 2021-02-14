const fs = require('fs');
const mongoose = require('mongoose');

const Achievement = require('./models/Achievement');
const QuestTemplate = require('./models/QuestTemplate');

mongoose.connect('mongodb+srv://tysin:tysin@cluster0.dx5ui.mongodb.net/<dbname>?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
});

//read file synchronously (till read completion)
const achievements = JSON.parse(fs.readFileSync(`${__dirname}/data/a.json`));
const quests = JSON.parse(fs.readFileSync(`${__dirname}/data/q.json`));

const importData = async () => {
  try {
    await Achievement.deleteMany();
    await Achievement.create(achievements);

    await QuestTemplate.deleteMany();
    await QuestTemplate.create(quests);
    console.log('Dummy data created');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
}