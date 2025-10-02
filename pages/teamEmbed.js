import { EmbedBuilder } from 'discord.js';
import Table from 'easy-table';
import { Dex } from '@pkmn/dex';
import { Generations } from '@pkmn/data';
import { emojiString } from '../data/module.js';
import { fetchPokemonSprite, fetchTypeHex } from '../utils/pokeUtils.js';
import { Smogon } from '@pkmn/smogon';
import fetch from 'cross-fetch';

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

const formatStats = (stats) => {
  const t = new Table();
  t.cell('HP', stats.hp);
  t.cell('Atk', stats.atk);
  t.cell('Def', stats.def);
  t.cell('SpA', stats.spa);
  t.cell('SpD', stats.spd);
  t.cell('Spe', stats.spe);
  t.cell('BST', Object.values(stats).reduce((a, b) => a + b, 0));
  t.newRow();
  return t.toString();
};

const teamEmbed = async (team, pokemon, gen) => {
  
  if (!team.length) throw new Error('Empty team array');
  
  const embed = new EmbedBuilder()
    .setTitle(`Random ${capitalize(team[0].types[0])}-Type Team`)
    .setThumbnail(fetchPokemonSprite(pokemon.name.toLowerCase(), 'gen5ani'))
    .setColor(fetchTypeHex(pokemon.types[0]))
    .setFooter({ text: `Gen ${gen}` })
    .setTimestamp();
  

  let description = '';

embed.addFields([{
  name: 'Moves:',
  value: '```' + team.map(mon => {
    const moveset = Smogon.get(gen).moveset.get(mon.name);
    const moves = moveset ? moveset.recommendedMoves.slice(0, 4).join(', ') : 'No moves data';
    return `${mon.name}: ${moves}`;
  }).join('\n') + '```',
  inline: false,
}]);

  for (const mon of team) {
    const data = Dex.species.get(mon.name);
    const statsTable = formatStats(data.baseStats);
    description += `**${capitalize(mon.name)}** @ ${mon.item || 'Leftovers'}\n`;
    description += `${emojiString(data.types)}\n`;
    description += `Abilities: ${Object.values(data.abilities).join(', ')}\n`;
    description += '```' + statsTable + '```\n\n';
  }

  embed.setDescription(description);
  return { embeds: [embed] };
};

const fetchInfo = async (pokemon, gen) => {
  const gens = new Dex.Generations(Dex);
    let infoData;
    let looping = true;
    while (looping) {
        try {
            infoData = await gens.get(gen).species.get(pokemon);
            if (infoData) return { gen: gen, data: infoData };
            gen--;
        } catch (err) {
            if (gen > 0) { gen--; }
            else { looping = false; }
        }
    }
    return { gen: 'this is really bad', data: 'why did this happen' };
};

function printInfo(pokemon) {
    console.log(pokemon['data'])
}



export { teamEmbed };
