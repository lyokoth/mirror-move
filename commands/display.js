import { SlashCommandBuilder } from 'discord.js';
import { parsePokepaste } from '../utils/pokeUtils.js';
import { displayEmbed } from '../pages/displayEmbed.js';
require('koffing').Koffing;

export default {
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
