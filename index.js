require("dotenv").config();
var CronJob = require('cron').CronJob;

const { Client } = require('discord.js');

const client = new Client({
  partials: ['MESSAGE', 'REACTION']
});

const PREFIX = "!";

// mognodb config
const mongoose = require('mongoose');
(async function () {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    })
  
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}())
const Rank = require("./models/Rank");
const User = require("./models/User");

client.on('ready', () => {
  console.log(`${client.user.tag} has logged in.`);
});

var chatAuthorIds = [];
var streamAuthorIds = {};

client.on('message', async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(PREFIX)) {
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);

    if (CMD_NAME === 'rank' && args[0] === '-a') {
      if (!message.content.includes('r:') || !message.content.includes('p:') || !message.content.includes('i:')) 
        return await message.channel.send(`Hmm you don't have everything for me to create a rank.`)

      var rankStartingIndex = message.content.indexOf('r:');
      var idStartingIndex = message.content.indexOf('i:');
      var pointsStartingIndex = message.content.indexOf('p:');

      var rankName = message.content.substring(rankStartingIndex, idStartingIndex - 1).replace(/\s+/g, ' ').trim();
      var id = message.content.substring(idStartingIndex, pointsStartingIndex - 1).replace(/\s+/g, ' ').trim();
      var points = message.content.substring(pointsStartingIndex, message.content.length).replace(/\s+/g, ' ').trim();

      // remove prefixes
      rankName = rankName.split('r: ')[1];
      id = id.split('i: ')[1];
      points = points.split('p: ')[1];

      // r: rank name
      // i: id of the role
      // p: points required
      console.log(`Rank name: ${rankName}, Id: ${id}, Points: ${points}`);

      var rank = await Rank.findOne({ rankName: rankName });
      if (rank) {
        rank.pointsRequired = points;
        rank.roleId = id;
        await rank.save();
        return await message.channel.send(`${rankName} has been updated.`);
      }
      
      rank = await Rank.create({ rankName: rankName, roleId: id, pointsRequired: points });
      return await message.channel.send(`${rankName} has been created.`);
    }
    else if (CMD_NAME === 'rank' && args[0] === '-r') {
      var rawRankName = message.content.split(`${PREFIX}rank -r `)[1];
      var rank = await Rank.findOne({ rankName: rawRankName });

      if (!rank) return await message.channel.send(`That rank doesn't exist.`);

      await rank.remove();
      return await message.channel.send(`${rawRankName} has been removed.`);
    } 
  }
  else {
      // add author id to array here
      var authorExists = chatAuthorIds.find((a) => a === message.author.id.toString());
      if (authorExists) return;
      return chatAuthorIds.push(message.author.id.toString());
  }
});

client.on('raw', packet => {
  if (packet.t === 'VOICE_STATE_UPDATE') {
    if (!streamAuthorIds[packet.d.user_id] && !packet.d.self_stream) streamAuthorIds[packet.d.user_id] = false; // user just enters channel
    else if ((streamAuthorIds[packet.d.user_id] === false || !streamAuthorIds[packet.d.user_id]) && packet.d.self_stream === true) streamAuthorIds[packet.d.user_id] = true; // if the user starts streaming
    console.log(streamAuthorIds);
  }
})

client.login(process.env.DISCORDJS_BOT_TOKEN).then(() => {
    // run cron job to assign points and empty array

    // new CronJob('* * * * * *', async function() {
    //   console.log("Granting points to users who've been chatting...");
    //     var chatAuthorIdsCopy = [...chatAuthorIds];
    //     chatAuthorIds = [];

    //     async function grantChatPoints () {
    //       for (var a of chatAuthorIdsCopy) {
    //         var statIncrease = Math.floor(Math.random() * (5 - 1 + 1)) + 1; // Random number between 1 (inclusive) and 5 (inclusive)
    //         var user = await User.findOne({ discordId: a });
    //         if (!user) user = await User.create({ discordId: a, points: statIncrease });
    //         else {
    //           user.points = user.points + statIncrease;
    //           user.coins = user.coins + statIncrease;
    //           await user.save();
    //         }
    //       }
    //     }

    //     await grantChatPoints();

    //   }, null, true, 'America/Toronto');

    //   new CronJob('* * * * * *', async function() {
    //     console.log("Granting points to users who've been streaming...");
    //     var streamAuthorIdsCopy = {...streamAuthorIds};
    //     streamAuthorIds = {};

    //     async function grantStreamPoints () {
    //       for (var key of Object.keys(streamAuthorIdsCopy)) {
    //         if (streamAuthorIdsCopy[key] === true) {
    //           var user = await User.findOne({ discordId: key });
    //           if (!user) user = await User.create({ discordId: a, points: 100 });
    //           else {
    //             user.points = user.points + 100;
    //             user.coins = user.coins + 100;
    //             await user.save();
    //           }
    //         }
    //       }
    //     }

    //     await grantStreamPoints();

    //   }, null, true, 'America/Toronto');

      // new CronJob('*/5 * * * * *', async function() {
      //   console.log("Deciding roles based on user db rank...");

      //   async function grantRolesFromPoints () {
      //     console.log(process.env.guildId);
      //     var ranks = await Rank.find();
      //     var members = await client.guilds.cache.get(process.env.guildId).members.fetch()
      //     console.log(members)

      //     for (var m of members) {
      //       var user = await User.findOne({ discordId: m[0] });
      //       if (!user) {
      //         user = await User.create({ discordId: m[0] });
      //         // assign role of random kum
              
      //       }
      //       else {
      //         ranks.sort((a, b) => a.points - b.points);
              
      //         for (var i = 0; i < ranks.length; i++) {
      //           if (ranks[i] >= user.points && ranks[i + 1] <= user.points) console.log(ranks[i]);
      //         }
      //       }
      //       console.log(m[1]._roles); // discord roles
      //       console.log(m[0]); // discord member id
      //     }
      //   }

      //   await grantRolesFromPoints();

      // }, null, true, 'America/Toronto');

})