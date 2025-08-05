import { SlashCommandBuilder } from 'discord.js';
import { infoEmbed, errorEmbed } from '../pages/module.js';
import { autoCompletePokemon } from '../utils/module.js';
import { Dex } from '@pkmn/dex'; // Ensure this is installed
// You can remove cleanPokemonName & parseMonoType unless you want to use them elsewhere

const getMonoTypeTeam = (type, gen = 9) => {
  const allPokemon = Dex.species.all();

  const filtered = allPokemon.filter(poke => {
    return (
      poke.gen <= gen &&
      poke.baseStats &&
      poke.types.includes(type) &&
      !poke.name.includes('-Totem') &&
      !poke.name.includes('Starter') &&
      !poke.isNonstandard
    );
  });

  if (filtered.length < 6) return [];

  const shuffled = filtered.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6).map(p => p.name);
};

export default {
  data: new SlashCommandBuilder()
    .setName('monoteam')
    .setDescription('Return a random mono-type team of the given type.')
    .addStringOption(option =>
      option
        .setName('input')
        .setDescription('Enter a valid Pokémon type')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    await autoCompletePokemon(interaction); // You can change this to a type autocomplete if needed
  },

  async execute(interaction) {
    const type = interaction.options.getString('input').toLowerCase();
    const validTypes = [
      'normal', 'fire', 'water', 'electric', 'grass', 'ice',
      'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
      'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
    ];

    if (!validTypes.includes(type)) {
      return await interaction.reply(errorEmbed('Invalid type input. Please enter a valid Pokémon type.'));
    }

    const team = getMonoTypeTeam(type);

    if (team.length === 0) {
      return await interaction.reply(errorEmbed(`No Pokémon found for the type: ${type}`));
    }

    const embed = await infoEmbed(`Random ${type}-type team`, team);
    await interaction.reply(embed);
  }
};
