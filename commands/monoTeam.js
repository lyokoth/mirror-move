import { SlashCommandBuilder } from 'discord.js';
import { infoEmbed, errorEmbed } from '../pages/module.js';
import { parseMonoType } from '../utils/pokeUtils.js';
import { autoCompletePokemon, cleanPokemonName } from '../utils/module.js';


module.exports = {
    data: new SlashCommandBuilder()
        .setName('monoTeam')
        .setDescription('Return a mono-type team of the given type.')
        .addStringOption(option => 
            option.setName('input')
                .setDescription('Enter your type')
                .setRequired(true)
                .setAutocomplete(true)
        )
        ,
    async execute(interaction) {
        const input = interaction.options.getString('input');
        const types = parseMonoType(input);
        // Further processing with the types
    }
};
