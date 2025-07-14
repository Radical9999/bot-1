import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
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

const loadCommands = async dir => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await loadCommands(fullPath);
    } else if (file.endsWith('.js')) {
      try {
        const command = await import(pathToFileURL(fullPath).href);
        if (command?.data && command?.execute) {
          client.commands.set(command.data.name, command);
          commands.push(command.data.toJSON());
        } else {
          console.warn(`⚠️ Skipped invalid command file: ${fullPath}`);
        }
      } catch (err) {
        console.error(`❌ Error loading command file ${fullPath}:`, err);
      }
    }
  }
};

await loadCommands(path.join(__dirname, 'commands'));

const rest = new REST({ version: '10' }).setToken(config.token);
try {
  await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
  console.log('✅ Global commands registered.');
} catch (error) {
  console.error('❌ Failed to register commands:', error);
}

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  try {
    if (!interaction.isCommand() && !interaction.isMessageContextMenuCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction);
  } catch (error) {
    console.error('❌ Error executing command:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: '❌ There was an error.', ephemeral: true });
    }
  }
});

import { saveMessage, getRandomMessage, getChatChannel } from './chatMemory.js';

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  if (Math.random() < 0.3 && message.content.length > 5) {
    saveMessage(message.guild.id, message.content);
  }

  if (message.mentions.has(client.user)) {
    const reply = getRandomMessage(message.guild.id);
    if (reply) {
      await message.reply(reply);
    }
  }

  // Random talk in set channel
  const allowedChannel = getChatChannel(message.guild.id);
  if (allowedChannel && message.channel.id === allowedChannel) {
    if (Math.random() < 0.005) {
      const msg = getRandomMessage(message.guild.id);
      if (msg) message.channel.send(msg);
    }
  }
});

client.on('messageCreate', handleMessageXP);

client.login(config.token);
