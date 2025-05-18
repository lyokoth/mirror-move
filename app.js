import discord, { DMChannel } from 'discord.js'; 
import { Client, GatewayIntentBits, REST, Routes, Collection } from 'discord.js';
import { USERNAME, PASSWORD, FORMAT } from './config.js';
import { createRequire } from 'module';
i    

const axios = require('axios');
const utils = require('./utils.js');
const ReplayTracker = require('./tracker/ReplayTracker'); // use replay traacker to learn plays 
const bot = new discord.Client({
    fetchAllMembers: true,
    commands: new discord.Collection(),
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ]

});
['commands'].forEach((x) => (bot[x] = new Collection()));
// Setting up process.env\

const rest = REST({version: '10'}).setToken(TOKEN);

//

// login function
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.ws.on(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});
client.ws.on(Events.InteractionCreate, async (interaction) => {
    let link = interaction.data.options[0].value + ".log";  
    let response = await axios
        .get(link, {
            headers: { "User-Agent": "ShowdownBot" },
        })
        .catch((e) => console.error(e));
    let data = response.data;




    if (interaction.isCommand()) {
        const { commandName } = interaction;
        if (commandName === 'ping') {
            interaction.reply('Pong!'); 
        }
    }
});

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('Pokémon Showdown', { type: 'WATCHING' });
});


client.login(TOKEN);