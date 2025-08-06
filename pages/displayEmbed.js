import { EmbedBuilder } from 'discord.js';
import { classifyPokemon } from '../utils/pokeUtils.js';
import { StringHelper } from '../utils/stringUtils.js';
import { emojiString } from '../data/module.js';
import { cleanPokemonName, fetchPokemonSprite, fetchTypeHex } from '../utils/pokeUtils.js';

const displayEmbed = (json) => {
	const data = JSON.parse(json).teams[0];
	const embeds = [];
	data.pokemon.forEach((pokemon) => {
		pokemon.name = cleanPokemonName(pokemon.name);
		const embed = new EmbedBuilder()
			.setThumbnail(fetchPokemonSprite(pokemon.name, 6))
			.setImage(`https://www.serebii.net/itemdex/sprites/${StringHelper.toLowerRemoveSpace(pokemon.item)}.png`)
			.addFields({
				name: (pokemon.nickname == undefined ? pokemon.name : `${pokemon.nickname} (${pokemon.name})`) + emojiString(returnPokemonType(pokemon.name)),
				value: formatDisplayData(pokemon),
			});
		embed.setColor(fetchTypeHex(pokemon.name));
		embeds.push(embed);
	});
	return {
		embeds: embeds,
		ephemeral: false,
	};
};


const formatDisplayData = (pokemon) => {
    let str = '';
    if (pokemon.level === 'undefined') {
        str += '`lvl: 100`\n';

    } else {
        str += '`lvl: ' + pokemon.level + '`\n';
    }
    str += `\`Ability: ${pokemon.ability}\`\n`;
    if (pokemon.nature) {
        str += `\`Nature: ${pokemon.nature}\`\n`;
    }
    if (pokemon.evs) {
        const evs = pokemon.evs;
        str += `'` + ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'].filter(function(prop) {
				return !isNaN(evs[prop.toLowerCase()]);
			})
			.map(
				function(prop) {
					const val = evs[prop.toLowerCase()];
					return `${val} ${prop}`;
				},
			)
			.join(' / ') + '`\n';
            
       const classification = classifyPokemon(evs, pokemon.nature)
        str += `\`Classification: ${classification}\`\n`;
    }
    if (pokemon.moves) {
        str += `'` + StringHelper.createAlignedString(pokemon.moves) + '`\n';
    }
    if (pokemon.item) {
        str += `\`Item: ${(pokemon.item)}\`\n`;
    }
    return str;
}
export { displayEmbed };