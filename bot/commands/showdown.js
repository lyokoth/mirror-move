import { Smogon } from '@pkmn/smogon';
import { SlashCommandBuilder } from 'discord.js';
import { battleEmbed } from '../pages/battleEmbed.js';


export default {
    data: new SlashCommandBuilder()
    .setName('showdown')
    .setDescription('Initiates a battle on a Showdown server with the bot')
    .addStringOption(option =>
        option
            .setName('format')
            .setDescription('The format to battle in')
            .setRequired(true)
            .setAutocomplete(true)
    )
    .addStringOption(option =>
        option
            .setName('username')
            .setDescription('enter your username')
            .setRequired(true)
            .setAutocomplete(true)
    ),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name === 'format') {
            const formats = await Smogon.formats();
            const filteredFormats = formats.filter(format => format.startsWith(focusedOption.value));
            await interaction.respond(
                filteredFormats.map(format => ({ name: format, value: format }))
            );
        } else if (focusedOption.name === 'username') {
            // You can implement username autocomplete logic here if needed
            await interaction.respond([]);
        }
    },
    async execute(interaction) {
        const format = interaction.options.getString('format');
        const username = interaction.options.getString('username');
        try {
            const embed = await battleEmbed(format, username);
            await interaction.reply(embed);
        } catch (err) {
            await interaction.reply({ content: `Error: ${err.message}`, ephemeral: true });
        }
    },
}