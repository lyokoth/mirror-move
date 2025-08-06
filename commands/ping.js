import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default {
  data: new SlashCommandBuilder()
    .setName('ding')
    .setDescription("dong! let's battle!"),

  async execute(interaction) {
    const markup = await axios.get('https://play.pokemonshowdown.com/sprites/gen5/');
    const $ = cheerio.load(markup.data);
  

  const links = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && (href.includes('urshifu') || href.includes('galar')) && !href.includes('shiny')) {
      console.log(`\`${href}\`,`);
      links.push(href);
    }
  });

  console.log(`Total matching links: ${links.length}`);
  await interaction.reply(`dong! let's battle, ${interaction.user.username}!`);
}
} 