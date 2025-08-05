import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import cheerio from 'cheerio';


export default {
	data: new SlashCommandBuilder()
		.setName('ding')
		.setDescription('dong! let`s battle, `${username}`!'),
	async execute(interaction) {
		const markup = await axios.get('https://play.pokemonshowdown.com/sprites/gen5/');
		const $ = cheerio.load(markup.data);
		const parsedTeam = $('a').text().split('.png');
		parsedTeam.forEach(element => {
			if ((element.includes('urshifu') || element.includes('galar') && !element.includes('shiny'))) console.log('`' + element + '`,');
		});
		console.log(parsedTeam.length);
		await interaction.reply('Pong!');
	},
};