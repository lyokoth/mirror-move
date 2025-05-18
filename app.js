import discord, { DMChannel } from 'discord.js'; 
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { USERNAME, PASSWORD, FORMAT } from './config.js';
import { createRequire } from 'module';

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

const rest = REST({version: '10'}).setToken(TOKEN);

// login function
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on(Events.ClientReady, readyClient => {
    console.log(`Logged in as ${readyClient.user.tag}!`);
});
client.on(Events.InteractionCreate, interaction => {
    if (interaction.isCommand()) {
        const { commandName } = interaction;
        if (commandName === 'ping') {
            interaction.reply('Pong!');
        }
    }
});
client.login(TOKEN);