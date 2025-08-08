import { SlashCommandBuilder } from 'discord.js';
import { infoEmbed, errorEmbed } from '../pages/module.js';
import { autoCompletePokemon, cleanPokemonName } from '../utils/module.js';

export default {
    data: new SlashCommandBuilder()
        .setName('teambuilder')
        .setDescription('Builds a randomized team with the given Pokemon')
        .addStringOption(option =>
            option
                .setName('input')
                .setDescription('The input Pokemon')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option
                .setName('format')
                .setDescription('The format for the team (e.g., OU, Ubers)')
                .setRequired(true)),
    async autocomplete(interaction) {
        await autoCompletePokemon(interaction);
    }
    ,
    async execute(interaction) {
        const input = interaction.options.getString('input');
        const format = interaction.options.getString('format');
        try {
            const team = await buildRandomTeam(input, format);
            await interaction.reply({ embeds: [teamEmbed(team)] });
        } catch (error) {
            await interaction.reply(errorEmbed(error.message));
        }
    }
};

//  add teambuilder based on format and tier