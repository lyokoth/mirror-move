// Matchup dmg calc
import { SlashCommandBuilder } from "discord.js";
import { Generations } from "@pkmn/data";
import { Dex } from "@pkmn/dex";
import { calculate, Pokemon, Move } from "@smogon/calc";
import { fetchPokemonSprite, fetchTypeHex } from "../utils/pokeUtils.js";

const gens = new Generations(Dex);

export default {
  data: new SlashCommandBuilder()
    .setName("matchup")
    .setDescription("Show a damage calculation between two Pokémon")
    .addStringOption(option =>
      option.setName("attacker")
        .setDescription("Attacking Pokémon (e.g. Haxorus)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("move")
        .setDescription("Move the attacker is using (e.g. Earthquake)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("defender")
        .setDescription("Defending Pokémon (e.g. Skarmory)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("tier")
        .setDescription("Tier (default: gen9ou)")
        .setRequired(false)
    ),

  async execute(interaction) {
  const attackerName = interaction.options.getString("attacker");
  const moveName = interaction.options.getString("move");
  const defenderName = interaction.options.getString("defender");
  const tier = interaction.options.getString("tier") || "gen9ou";

  const attackerSpecies = Dex.species.get(attackerName);
  const defenderSpecies = Dex.species.get(defenderName);

  if (!attackerSpecies.exists || !defenderSpecies.exists) {
    return interaction.reply({ content: "❌ Invalid Pokémon provided.", ephemeral: true });
  }

  const gen = gens.get(9); // default to Gen 9 for now

  // Basic spreads (later you could pull Smogon set spreads like we did in /set)
  const attacker = new Pokemon(gen, attackerSpecies.name, {
    item: "Life Orb",
    ability: attackerSpecies.abilities[0],
    evs: { atk: 252, spe: 252 },
    nature: "Jolly",
  });

  const defender = new Pokemon(gen, defenderSpecies.name, {
    item: "Leftovers",
    ability: defenderSpecies.abilities[0],
    evs: { hp: 252, def: 252 },
    nature: "Bold",
  });

  const move = new Move(gen, moveName);

  // Run the calculation
  const result = calculate(gen, attacker, defender, move);

  const attackerSprite =  await fetchPokemonSprite(attackerSpecies.id);
  const defenderSprite = await fetchPokemonSprite(defenderSpecies.id);

  const embed = {
    color: await fetchTypeHex(move.type) ?? 0xE74C3C,
    title: `⚔️ Matchup: ${attackerSpecies.name} vs ${defenderSpecies.name}`,
    thumbnail: { url: attackerSprite },
    fields: [
      { name: "Move", value: `${moveName}`, inline: true },
      { name: "Damage", value: `${result.range()[0]}% - ${result.range()[1]}%`, inline: true },
      { name: "KO Chance", value: result.desc(), inline: false },
    ],
    image: { url: defenderSprite },
    footer: { text: `Tier: ${tier}` }
  };

  return interaction.reply({ embeds: [embed] });
  }
};