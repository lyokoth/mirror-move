import { EmbedBuilder } from 'discord.js';
import Table from 'easy-table';
import { Dex } from '@pkmn/dex';
import { emojiString } from '../data/module.js';
import { fetchTypeHex } from '../utils/pokeUtils.js';

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

const teamEmbed = async (team, gen) => {
  const embed = new EmbedBuilder()
    .setTitle(`Random ${capitalize(team[0].types[0])}-Type Team`)
    .setColor(fetchTypeHex(team[0].name))
    .setTimestamp();

  let description = '';

  for (const mon of team) {
    const data = Dex.species.get(mon.name);
    const statsTable = formatStats(data.baseStats);
    description += `**${mon.name}** @ ${mon.item || 'Leftovers'}\n`;
    description += `${emojiString(data.types)}\n`;
    description += `Abilities: ${Object.values(data.abilities).join(', ')}\n`;
    description += '```' + statsTable + '```\n\n';
  }

  embed.setDescription(description);
  return { embeds: [embed] };
};

export { teamEmbed };
