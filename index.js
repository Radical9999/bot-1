// ✅ Full index.js with chatbot toggle + random chat toggle
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
  Events
} from 'discord.js';
import {
  saveMessage,
  getRandomMessage,
  getChatChannel,
  isChatbotEnabled,
  isRandomReplyEnabled
} from './chatMemory.js';
import handleMessageXP from './utils/messageXpSystem.js';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
const commands = [];

// Load commands
const loadCommands = async dir => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await loadCommands(fullPath);
    } else if (file.endsWith('.js')) {
      const command = await import(pathToFileURL(fullPath).href);
      if (command?.data && command?.execute) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(`✅ Loaded command: ${command.data.name}`);
      }
    }
  }
};

await loadCommands(path.join(__dirname, 'commands'));

const rest = new REST({ version: '10' }).setToken(config.token);
try {
  await rest.put(
    Routes.applicationCommands(config.clientId),
    { body: commands }
  );
  console.log(`✅ Global slash commands registered: ${commands.map(c => c.name).join(', ')}`);
} catch (err) {
  console.error('❌ Failed to register commands:', err);
}

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand() && !interaction.isMessageContextMenuCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`❌ No command matching ${interaction.commandName}`);
    return;
  }
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`❌ Error executing ${interaction.commandName}:`, err);
    const reply = { content: '❌ There was an error.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

function withPersonality(text) {
  const intros = [
    "😺 Here's a thought:", "🤖 Beep boop:", "🧠 Wisdom drop:",
    "🗣️ My opinion:", "🔊 Incoming:", "🎯 Random idea:", "🎤 Here's what I think:"
  ];
  return `${intros[Math.floor(Math.random() * intros.length)]} ${text}`;
}

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  try {
    await saveMessage(message.guild.id, message.content);

    const enabled = await isChatbotEnabled(message.guild.id);
    if (!enabled) return;

    if (message.mentions.has(client.user)) {
      const raw = await getRandomMessage(message.guild.id);
      if (!raw) return;
      const reply = withPersonality(raw);
      const talkChannelId = await getChatChannel(message.guild.id);
      const target = talkChannelId
        ? await client.channels.fetch(talkChannelId).catch(() => null)
        : message.channel;
      if (target?.isTextBased()) await target.send(reply);
    }
  } catch (err) {
    console.error('❌ Mention-reply error:', err);
  }
});

client.on('messageCreate', handleMessageXP);

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  (function randomChat() {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 8) {
      console.log('🌙 Quiet hours — bot will not speak.');
    } else {
      client.guilds.cache.forEach(async guild => {
        try {
          const enabled = await isRandomReplyEnabled(guild.id);
          if (!enabled) return;

          const channelId = await getChatChannel(guild.id);
          if (!channelId) return;

          const channel = await client.channels.fetch(channelId).catch(() => null);
          if (!channel?.isTextBased()) return;

          const raw = await getRandomMessage(guild.id);
          if (!raw) return;

          const reply = withPersonality(raw);
          await channel.send(reply);
        } catch (err) {
          console.error('❌ Interval chat error:', err);
        }
      });
    }
    const next = Math.floor(Math.random() * 20 + 1) * 60 * 1000;
    setTimeout(randomChat, next);
  })();
});

client.login(config.token);
