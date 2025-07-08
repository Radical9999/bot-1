import fs from 'fs';
import path from 'path';
import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import { fileURLToPath } from 'url';
import { db } from './db.js'; // assuming db.js is converted to ES module
import handleMessageXP from './utils/messageXpSystem.js'; // ✅ keep just this one

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
  commands.push(command.default.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.token);
await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (command) await command.execute(interaction);
});

// ✅ Use only this one message XP system
client.on('messageCreate', handleMessageXP);

client.once('ready', () => console.log(`Logged in as ${client.user.tag}`));

client.login(config.token);
