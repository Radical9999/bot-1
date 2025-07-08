import fs from 'fs';
import path from 'path';
import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import { fileURLToPath } from 'url';

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

import { handleXPAndCoins } from './levelSystem.js';
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  await handleXPAndCoins(message.author.id);
});

client.once('ready', () => console.log(`Logged in as ${client.user.tag}`));
client.login(config.token);

const { db } = require('./db'); // or wherever your db.js is
const cooldown = new Set();

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  // Cooldown to prevent XP/coin spam (e.g., 30s per user)
  if (cooldown.has(message.author.id)) return;
  cooldown.add(message.author.id);
  setTimeout(() => cooldown.delete(message.author.id), 30000);

  const xpGained = Math.floor(Math.random() * 10) + 5;
  const coinsGained = Math.floor(Math.random() * 5) + 1;

  let userData = db.get('users').find({ id: message.author.id });

  if (!userData.value()) {
    db.get('users')
      .push({ id: message.author.id, xp: xpGained, level: 0, coins: coinsGained })
      .write();
  } else {
    userData.update('xp', n => n + xpGained).update('coins', n => n + coinsGained).write();
  }

  // Optional: auto level up
  userData = db.get('users').find({ id: message.author.id }).value();
  const levelUpXp = 100 + userData.level * 25;

  if (userData.xp >= levelUpXp) {
    db.get('users').find({ id: message.author.id })
      .update('level', n => n + 1)
      .update('xp', n => n - levelUpXp)
      .write();

    message.channel.send(`🎉 ${message.author} leveled up to **${userData.level + 1}**!`);
  }
});

const handleMessageXP = require('./utils/messageXpSystem');
client.on('messageCreate', handleMessageXP);