import fs from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';
import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import { db } from './db.js';
import handleMessageXP from './utils/messageXpSystem.js';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
const commands = [];

const commandsPath = path.join(__dirname, 'commands');
const entries = fs.readdirSync(commandsPath);

for (const entry of entries) {
  const entryPath = path.join(commandsPath, entry);
  const stat = fs.statSync(entryPath);

  if (stat.isFile() && entry.endsWith('.js')) {
    const command = await import(pathToFileURL(entryPath).href);
    if ('data' in command.default && 'execute' in command.default) {
      client.commands.set(command.default.data.name, command.default);
      commands.push(command.default.data.toJSON());
    }
  }

  if (stat.isDirectory()) {
    const nestedFiles = fs.readdirSync(entryPath).filter(f => f.endsWith('.js'));
    for (const file of nestedFiles) {
      const filePath = path.join(entryPath, file);
      const command = await import(pathToFileURL(filePath).href);
      if ('data' in command.default && 'execute' in command.default) {
        client.commands.set(command.default.data.name, command.default);
        commands.push(command.default.data.toJSON());
      }
    }
  }
}

const rest = new REST({ version: '10' }).setToken(config.token);

try {
  await rest.put(
    Routes.applicationCommands(config.clientId),
    { body: commands }
  );
  console.log('✅ Global commands registered.');
} catch (err) {
  console.error('❌ Error registering commands:', err);
}

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (command) {
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ There was an error executing that command.', ephemeral: true });
    }
  }
});

client.on('messageCreate', handleMessageXP);

client.login(config.token);