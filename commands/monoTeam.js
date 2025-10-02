import { SlashCommandBuilder } from 'discord.js';
import { Dex } from '@pkmn/dex';
import Table from 'easy-table';



const validTypes = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const typeColor = {
  fire: 0xF08030,
  water: 0x6890F0,
  grass: 0x78C850,
  electric: 0xF8D030,
  ground: 0xE0C068,
  rock: 0xB8A038,
  flying: 0xA890F0,
  bug: 0xA8B820,
  poison: 0xA040A0,
  normal: 0xA8A878,
  fighting: 0xC03028,
  psychic: 0xF85888,
  ghost: 0x705898,
  ice: 0x98D8D8,
  dragon: 0x7038F8,
  dark: 0x705848,
  steel: 0xB8B8D0,
  fairy: 0xEE99AC
};

const items = [
  'Leftovers', 'Life Orb', 'Choice Band', 'Choice Specs',
  'Focus Sash', 'Assault Vest', 'Black Sludge', 'Sitrus Berry'
];

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

const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

const getMonoTypeTeam = (type, gen = 9) => {
  const allPokemon = Dex.species.all();

  const filtered = allPokemon.filter(p => {
    return (
      p.gen <= gen &&
      p.baseStats &&
      p.types.map(t => t.toLowerCase()).includes(type) &&
      !p.name.includes('-Totem') &&
      !p.name.includes('-Gmax') &&
      !p.name.includes('-Mega') &&
      !p.isNonstandard
    );
  });

  if (filtered.length < 6) return [];

  // Shuffle and pick 6 unique families
  const usedFamilies = new Set();
  const team = [];

  const shuffled = filtered.sort(() => Math.random() - 0.5);
  for (const p of shuffled) {
    const baseSpecies = p.baseSpecies || p.name;
    if (!usedFamilies.has(baseSpecies)) {
      usedFamilies.add(baseSpecies);
      team.push(p);
    }
    if (team.length === 6) break;
  }

  // Assign random items
  return team.map(p => ({
    name: p.name,
    types: p.types,
    baseStats: p.baseStats,
    abilities: p.abilities,
    item: items[Math.floor(Math.random() * items.length)],
    nature: p.nature 
  }));
};
  
const infoEmbed = (type, team) => {
  return {
    embeds: [
      {
        title: `Randomized ${capitalize(type)} Team`,
        description: team.map((p, i) => {
          const emojis = p.types.map(t => typeEmoji(t)).join(' ');  // <-- renamed variable here
          const typeStr = p.types.join(' / ');
          const abilitiesStr = Object.values(p.abilities).join(', ');
          return `**${i + 1}. ${p.name}**  
_Type:_ ${typeStr}  ${emojis}
_Abilities:_ ${abilitiesStr}  \n${formatStats(p.baseStats, p.baseStats.bst)}
_Held Item:_ ${p.item}`;
        }).join('\n\n'),
        color: typeColor[type] || 0x5149bf
      }
    ]
  };
};


const errorEmbed = (msg) => ({
  embeds: [
    {
      title: 'Error',
      description: msg,
      color: 0xff4f4f
    }
  ]
});

const autoCompleteType = async (interaction) => {
  const focused = interaction.options.getFocused(true).value.toLowerCase();
  const filtered = validTypes.filter(t => t.startsWith(focused)).slice(0, 25);
  await interaction.respond(filtered.map(t => ({ name: capitalize(t), value: t })));
};

export default {
  data: new SlashCommandBuilder()
    .setName('mono')
    .setDescription('Generate randomized team by type.')
    .addStringOption(option =>
      option
        .setName('input')
        .setDescription('Enter a valid Pokémon type')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    await autoCompleteType(interaction);
  },

  async execute(interaction) {
    const type = interaction.options.getString('input').toLowerCase();

    if (!validTypes.includes(type)) {
      return await interaction.reply(errorEmbed('Invalid type input. Please enter a valid Pokémon type.'));
    }

    const team = getMonoTypeTeam(type);

    if (team.length === 0) {
      return await interaction.reply(errorEmbed(`No Pokémon found for the type: ${type}`));
    }

    const embed = infoEmbed(type, team);
    await interaction.reply(embed);
  }
};
