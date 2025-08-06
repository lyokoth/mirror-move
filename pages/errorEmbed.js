import { EmbedBuilder } from 'discord.js';

const errorEmbed = (err) => {
	console.error(err);
	const embed = new EmbedBuilder()
		.setColor(0xeb3434)
		.setTitle(err.message)
		.setDescription('Sorry, an error occurred!')
		.setTimestamp();
	return {
		embeds: [embed],
		ephemeral: true,
	};
};

export { errorEmbed };