import { EmbedBuilder } from 'discord.js';
import { returnPokemonType, fetchPokemonSprite, StringHelper, fetchTypeHex } from '../utils/pokeUtils.js';
import { emojiString } from '../data/module.js';
import { Dex } from '@pkmn/dex';
import { Generations } from '@pkmn/data';
import { Smogon } from '@pkmn/smogon';

const optimizeEmbed = (json) => {
	const data = JSON.parse(json).teams[0];
	const embeds = [];
	data.pokemon.forEach((pokemon) => {
		const embed = new EmbedBuilder()
			.setImage(fetchPokemonSprite(pokemon.name, 6))
			.setThumbnail(`https://www.serebii.net/itemdex/sprites/${StringHelper.toLowerRemoveSpace(pokemon.item)}.png`)
			.addFields({
				name: (pokemon.nickname == undefined ? pokemon.name : `${pokemon.nickname} (${pokemon.name})`) + emojiString(returnPokemonType(pokemon.name)),
				value: pokemonEmbedValue(pokemon),
			});
		embed.setColor(fetchTypeHex(pokemon.name));
		embeds.push(embed);
	});
	return {
		embeds: embeds,
		ephemeral: false,
	};
};


const pokemonEmbedValue = (pokemon) => {

};

const fetchCounters = async (pokemon, gen) => {
	const gens = new Generations(Dex);
	const smogon = new Smogon(fetch, true);
	let statsData;
	let looping = true;

	while (looping) {
		try {
			if (gen <= 0) looping = false;
			const genFormat = Smogon.format(gens.get(gen), pokemon);
			statsData = await smogon.stats(gens.get(gen), pokemon, genFormat);
			if (statsData) return { genFormat: genFormat, data: statsData };
			gen--;
		}
		catch (err) {
			if (gen > 0) { gen--; }
			else { looping = false; }
		}
	}
	return { genFormat: 'ERROR', data: 'No Stats Data Found' };
};

export { optimizeEmbed };