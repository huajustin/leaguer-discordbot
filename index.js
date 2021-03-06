const Discord = require('discord.js');
const {prefix, token} = require('./config.json');
const fs = require('fs');
const mongoose = require('mongoose');
const messagerService = require('./endpoints/services/message_service');

const dbURL = 'mongodb://localhost:27017/summoners';
const client = new Discord.Client();

// create command handler by importing local command modules and mapping to a collection
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    let reqCommand = require(`./commands/${file}`);
    client.commands.set(reqCommand.name, reqCommand);
}

// start database connection
mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("Database connected!");
});

// verify we have logged in
client.on('ready', () => {
    console.log('Logged in!');
});

// scan new messages from users and execute commands if valid
client.on('message', (msg) => {
    if (!msg.content.startsWith(prefix) || msg.author.bot) {
        return;
    }

    // separate command and arguments
    let args = msg.content.slice(prefix.length).split(' ');
    let command = args.shift().toLowerCase();

    // lookup and execute command
    try {
        client.commands.get(command).execute(msg, args);
    } catch (error) {
        console.error(error);
        msg.reply("Sorry, I couldn't execute that command!");
    }
});

client.login(token);

messagerService.startMessageService(client);
module.exports.mainClient = client;