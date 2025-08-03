const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log('Logged in as ' + client.user.tag);
        client.user.setActivity('Pokémon Showdown', { type: 'WATCHING' });
        client.user.setStatus('online');
    },
};