const Discord = require('discord.js');

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ]
});


module.exports = {

    USERNAME: 'showdisdisk',
    PASSWORD: 'VATONAGE',
    FORMAT: "gen9randombattle",
    SHOWDOWN_SERVER: 'wss://sim.smogon.com:443/showdown/websocket',
   

};