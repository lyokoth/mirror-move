import { SlashCommandBuilder } from 'discord.js';
import { infoEmbed, errorEmbed } from '../pages/module.js';
import { parsePokepaste } from '../utils/pokeUtils.js';
import { autoCompletePokemon, cleanPokemonName } from '../utils/module.js';

export default {
	data: new SlashCommandBuilder()
		.setName('summary')
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
	},

	async execute(interaction) {
		let gen = interaction.options.getInteger('gen');
		if (!gen) gen = 9;

		const pokemon = cleanPokemonName(interaction.options.getString('input'));

		try {
			const embed = await infoEmbed(pokemon, gen);
			await interaction.reply({ embeds: [embed] });
		} catch (err) {
			await interaction.reply({ embeds: [errorEmbed(err)] });
		}
	},
};
