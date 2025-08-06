import { SlashCommandBuilder } from 'discord.js';
import { Dex } from '@pkmn/dex';


// Embed helper
const infoEmbed = (type, team) => {
  return {
    embeds: [
      {
        title: `Random ${capitalize(type)}-Type Team`,
        description: team.map((p, i) => `**${i + 1}.** ${p}`).join('\n'),
        color: typeColor[type] ?? 0x5149bf
      }
    ]
  };
};

// Error helper
const errorEmbed = (msg) => {
  return {
    embeds: [
      {
        title: 'Error',
        description: msg,
        color: 0xff4f4f
      }
    ]
  };
};

// Autocomplete helper for types
const autoCompleteType = async (interaction) => {
  const focused = interaction.options.getFocused(true).value.toLowerCase();
  const filtered = validTypes.filter(t => t.startsWith(focused)).slice(0, 25);
  await interaction.respond(filtered.map(t => ({ name: capitalize(t), value: t })));
};

// Returns a shuffled team of 6 Pokémon of the given type
const getMonoTypeTeam = (type, gen = 9) => {
  const allPokemon = Dex.species.all();

  const filtered = allPokemon.filter(poke => {
    return (
      poke.gen <= gen &&
      poke.baseStats &&
      poke.types.includes(type) &&
      !poke.name.includes('-Totem') &&
      !poke.name.includes('-Gmax') &&
      !poke.name.includes('-Mega') &&
      !poke.name.includes('-Starter') &&
      !poke.name.includes('-BattleBond') &&
      !poke.name.includes('-Hisui') &&
      !poke.name.includes('-Galar') &&
      !poke.name.includes('-Alola') &&
      !poke.name.includes('-Therian') &&  
      !poke.isNonstandard
    );
  });

  if (filtered.length < 6) return [];

  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6).map(p => p.name);
};

// Utility: Capitalize the first letter
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Valid Pokémon types
const validTypes = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

// Optional: Hex colors for each type
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

export default {
  data: new SlashCommandBuilder()
    .setName('mono')
    .setDescription('Generate a random mono-type team from a Pokémon type.')
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
