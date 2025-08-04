import { SlashCommandBuilder } from 'discord.js';
const { infoEmbed, errorEmbed } = require('../pages/module');
const { autoCompletePokemon, cleanPokemonName, parseMonoType } = require('../utils/module');


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
        // Randomly generate a team by type (and gen if specified)
    async autocomplete(interaction) {
        await autoCompletePokemon(interaction);
    }
    ,
    async execute(interaction) {
        const type = interaction.options.getString('input');
        const types = parseMonoType(type);
        if (types.length === 0) {
            return await interaction.reply(errorEmbed('Invalid type input.'));
        }
        
        try {
            const embed = await infoEmbed(types[0], 9); // Assuming gen 9 for mono-type
            await interaction.reply(embed);
        } catch (err) {
            await interaction.reply(errorEmbed(err));
        }
    }
};
