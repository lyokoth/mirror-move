import { EmbedBuilder } from 'discord.js';
import Table from 'easy-table';
import { Dex } from '@pkmn/dex';
import { Generations } from '@pkmn/data';
import { returnPokemonType, fetchPokemonSprite, fetchTypeHex } from '../utils/pokeUtils.js';
import { emojiString } from '../data/module.js';


const infoEmbed = async (pokemon, gen) => {
	const info = await fetchInfo(pokemon, gen);
	const pokemonData = info.data;
	console.log(pokemonData);
	const embed = new EmbedBuilder()
		.setThumbnail(fetchPokemonSprite(pokemon.toLowerCase(), 'gen5ani'))
		.setColor(fetchTypeHex(pokemon))
		.setFooter({ text: 'Generation ' + gen })
		.setTimestamp()
		.setTitle(`${pokemonData.name} #${pokemonData.num}`)
		.setDescription(emojiString(returnPokemonType(pokemon)) + '\n```' +
		'Generation: ' + pokemonData.gen + '\n' +
		'Weight: ' + pokemonData.weightkg + 'kg\n' +
		'Abilities: \n ' + Object.values(pokemonData.abilities).join(', ') + '\n\n' +
		formatStats(pokemonData.baseStats, pokemonData.bst) + '```');

	return {
		embeds: [embed],
		flags: 0,
	};
};

const fetchInfo = async (pokemon, gen) => {
	const gens = new Generations(Dex);
	let infoData;
	let looping = true;

	while (looping) {
		try {
			infoData = await gens.get(gen).species.get(pokemon);
			if (infoData) return { gen: gen, data: infoData };
			gen--;
		}
		catch (err) {
			if (gen > 0) { gen--; }
			else { looping = false; }
		}
	}

	return { gen: 'this is really bad', data: 'why did this happen' };
};

const formatStats = (stats, bst) => {
	const t = new Table();
	t.cell('HP', stats.hp);
	t.cell('Atk', stats.atk);
	t.cell('Def', stats.def);
	t.cell('SpA', stats.spa);
	t.cell('SpD', stats.spd);
	t.cell('Spe', stats.spe);
	t.cell('BST', bst);
	t.newRow();

	return t.toString();
};

function printInfo(pokemon) {
	console.log(pokemon['data']);
}

export { infoEmbed };