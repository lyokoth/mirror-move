import { SlashCommandBuilder } from 'discord.js';
import { infoEmbed, errorEmbed } from '../pages/module.js';
import { autoCompletePokemon, cleanPokemonName } from '../utils/module.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Returns basic information regarding a given pokemon')
        .addStringOption(option =>
            option
                .setName('input')
                .setDescription('The input Pokemon')
                .setRequired(true)
                .setAutocomplete(true))
        .addIntegerOption(option =>
            option
                .setName('gen')
                .setDescription('The chosen generation')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(9)),
    async autocomplete(interaction) {
        await autoCompletePokemon(interaction);
    }
    ,
    async execute(interaction) {
        let gen = interaction.options.getInteger('gen');
        if (!gen) gen = 9;
        const pokemon = cleanPokemonName(interaction.options.getString('input'));
        try {
            const embed = await infoEmbed(pokemon, gen);
            await interaction.reply(embed);
        }
        catch (err) {
            await interaction.reply(errorEmbed(err));
        }

    }
};

