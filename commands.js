import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';



const commands = [];
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all JS files in ./commands
const commandFiles = fs
.readdirSync(path.join(__dirname, 'commands'))
.filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(__dirname, 'commands', file);
  const { default: command } = await import(pathToFileURL(filePath).href);


  if (!command?.data?.toJSON) {
    console.warn(`[WARN] Skipping ${file} — missing or invalid 'data' export`);
    continue;
  }

  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
