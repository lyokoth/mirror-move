const { SlashCommandBuilder } = require('discord.js');
const { parsePokePaste } = require ('../utils/module');
const { displayEmbed } = require('../pages/module');
require('koffing').Koffing;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('display')
        .setDescription('Displays Pokémon info from PokePaste.')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The Pokémon to display')
                .setRequired(true)),

    async execute(interaction) {
        const parsedTeam = await parsePokepaste(interaction.options.getString('input'));
		await interaction.reply(displayEmbed(parsedTeam.toJson()));
	},
};