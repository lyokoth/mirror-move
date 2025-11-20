import {SlashCommandBuilder} from 'discord.js';
import { Smogon } from '@pkmn/smogon';
import  { battleEmbed } from '../pages/battleEmbed.js';

export default {
    data: new SlashCommandBuilder()
        .setName('battle')
        .setDescription('Starts a battle against the bot')
        .addStringOption(option =>
            option.setName('pokemon')
                .setDescription('Enter a valid Pokémon name')
                .setRequired(true)
)
        .addStringOption(option =>
            option.setName('tier')
                .setDescription('Tier (default: gen9ou)')
                .setRequired(false)
        ),
         async execute(interaction) {
        const pokemonName = interaction.options.getString('pokemon');
        const tier = interaction.options.getString('tier') || 'gen9ou';

        const smogon = new Smogon();
        const gens = new Generations(Dex);
        const genMatch = tier.match(/gen(\d+)/);
        const genNumber = genMatch ? parseInt(genMatch[1]) : 9;
        const gen = gens.get(genNumber);
        const genFormat = Smogon.format(gen, pokemonName);
        const sets = await smogon.sets(gen, pokemonName, genFormat);
            
        if (!sets || sets.length === 0) {
            return interaction.reply({ content: `No sets found for **${pokemonName}** in **${tier}**.`, ephemeral: true });
        }

        const set = sets[0];
        const embed = await battleEmbed(pokemonName, set);
        await interaction.reply({ embeds: [embed] });
    }
 
};