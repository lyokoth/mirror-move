import { SlashCommandBuilder } from 'discord.js';

import { displayEmbed } from '../pages/displayEmbed.js';
import { parsePokepaste } from '../utils/pokeUtils.js';
import { autoCompletePokemon, cleanPokemonName } from '../utils/module.js';
import { errorEmbed } from '../pages/errorEmbed.js';

export default {
  	data: new SlashCommandBuilder()
		.setName('display')
		.setDescription('Displays Pokémon info from PokePaste.')
		.addStringOption(option =>
			option
				.setName('input')
				.setDescription('The input PokePaste')
				.setRequired(true)),
	async execute(interaction) {
		const parsedTeam = await parsePokepaste(interaction.options.getString('input'));
		await interaction.reply(displayEmbed(parsedTeam.toJson()));
        console.log(parsedTeam.toJson());
        
	},
};