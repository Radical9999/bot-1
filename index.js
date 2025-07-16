// index.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes
} from 'discord.js';
import handleMessageXP from './utils/messageXpSystem.js';
import {
  saveMessage,
  getRandomMessage,
  getChatChannel
} from './chatMemory.js';

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

// Load slash/context commands
const loadCommands = async dir => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await loadCommands(fullPath);
    } else if (file.endsWith('.js')) {
      try {
        const cmd = await import(pathToFileURL(fullPath).href);
        if (cmd?.data && cmd?.execute) {
          client.commands.set(cmd.data.name, cmd);
          commands.push(cmd.data.toJSON());
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

// Register commands
const rest = new REST({ version: '10' }).setToken(config.token);
try {
  await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
  console.log('✅ Global commands registered.');
} catch (err) {
  console.error('❌ Failed to register commands:', err);
}

// Personality intro function
function withPersonality(text) {
  const intros = [
    "😺 Your friendly bot says:",
    "🤖 Beep boop—here's my thought:",
    "🧠 Brain blast incoming:",
    "💬 Just tossing this out there:",
    "🐱 Did someone say wisdom?",
    "🔊 Incoming transmission:",
    "📣 Hey listen!",
    "🧋 Sippin' tea and thinkin':",
    "😼 In my humble opinion:",
    "👀 Look what I found:",
    "🌟 Just a random gem:",
    "🎲 Rolled this idea:",
    "🎉 Surprise thought:",
    "🎤 Mic drop moment:",
    "🎮 Gamer thoughts loading...",
    "📡 Broadcast from bot HQ:",
    "🎧 Here's what’s playing in my head:",
    "📘 Fun fact… maybe:",
    "🕵️ I’ve analyzed this:",
    "🧊 Cool take coming in:",
    "🌈 Mood today says:",
    "🎭 Feeling dramatic so here:",
    "🧶 Spinning this thread:",
    "🌍 Universal truth alert:",
    "🎯 Straight to the point:",
    "🔮 The spirits told me this:",
    "🍿 Grab popcorn for this one:",
    "🚀 Buckle up, thought ahead:",
    "📀 Rewinding to this idea:",
    "🎃 Creepy little comment:",
    "🪐 Cosmic thought blast:",
    "🥁 Drumroll... here it is:",
    "💡 Thought of the moment:",
    "📦 Random box says:",
    "🎨 Paintin’ you a picture:",
    "🪄 Magic whisper:",
    "💭 From deep in my memory banks:"
  ];

  const prefix = intros[Math.floor(Math.random() * intros.length)];
  return `${prefix} ${text}`;
}

// Reply when mentioned
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  try {
    await saveMessage(message.guild.id, message.content);
    const mentioned = message.mentions.has(client.user);
    if (mentioned) {
      const raw = await getRandomMessage(message.guild.id);
      if (!raw) return;
      const reply = withPersonality(raw);
      const talkChannelId = await getChatChannel(message.guild.id);
      const target = talkChannelId
        ? await client.channels.fetch(talkChannelId).catch(() => null)
        : message.channel;
      if (target?.isTextBased()) {
        await target.send(reply);
      }
    }
  } catch (err) {
    console.error('❌ Mention-reply error:', err);
  }
});

// XP system
client.on('messageCreate', handleMessageXP);

// Random chatter every 1–20 minutes
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  (function randomChat() {
    const now = new Date();
    const hour = now.getHours(); // local time (0–23)

    if (hour >= 0 && hour < 8) {
      console.log('🌙 Quiet hours (20:00–07:00 local time) — skipping message.');
    } else {
      client.guilds.cache.forEach(async guild => {
        try {
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

    const next = Math.floor(Math.random() * (20 - 1 + 1) + 1) * 60 * 1000; // 1–20 min
    setTimeout(randomChat, next);
  })();
});

client.login(config.token);
