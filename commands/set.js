// commands/set.js
import { SlashCommandBuilder } from "discord.js";
import { Smogon } from "@pkmn/smogon";  
import { Dex } from "@pkmn/dex";
import { Generations } from "@pkmn/data";
import { fetchPokemonSprite, fetchTypeHex } from "../utils/pokeUtils.js";

// set up generations + smogon
const gens = new Generations(Dex);
const smogon = new Smogon(gens);

export const data = new SlashCommandBuilder()
  .setName("set")
  .setDescription("Shows the recommended/most common set for a Pokémon.")
  .addStringOption(option =>
    option.setName("pokemon")
      .setDescription("Enter a valid Pokémon name")
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName("tier")
      .setDescription("Tier (default: gen9ou)")
      .setRequired(false)
  );

export async function execute(interaction) {
  const pokemonName = interaction.options.getString("pokemon");
  const tier = interaction.options.getString("tier") || "gen9ou";

  const species = Dex.species.get(pokemonName);
  if (!species.exists) {
    return interaction.reply({ content: `❌ Pokémon **${pokemonName}** not found.`, ephemeral: true });
  }

  // Fetch Smogon sets for the Pokémon in the tier
  const sets = await smogon.sets(species, tier);
  if (!sets || sets.length === 0) {
    return interaction.reply({ content: `No sets found for **${species.name}** in **${tier}**.`, ephemeral: true });
  }

  const set = sets[0]; // Just grab the first (most common) set
  const sprite = await fetchPokemonSprite(species.id);
  const typeColor = await fetchTypeHex(species.types[0]);

  const embed = {
    color: typeColor ?? 0x5865F2,
    title: `${species.name} — ${set.name || "Smogon Set"}`,
    thumbnail: { url: sprite },
    fields: [
      { name: "Item", value: set.item || "—", inline: true },
      { name: "Ability", value: set.ability || "—", inline: true },
      { name: "Nature", value: set.nature || "—", inline: true },
      { name: "EVs", value: Object.entries(set.evs).map(([stat, val]) => `${val} ${stat}`).join(" / ") || "—", inline: false },
      { name: "Moves", value: set.moves.map(m => `- ${m}`).join("\n") || "—", inline: false },
    ],
    footer: { text: `Tier: ${tier}` }
  };

  return interaction.reply({ embeds: [embed] });
}
