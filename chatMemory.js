import fs from 'fs';
const dbPath = './chatMemoryData.json';
let memory = {};

if (fs.existsSync(dbPath)) {
  memory = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

// Save a message to memory
export function saveMessage(guildId, message) {
  if (!memory[guildId]) memory[guildId] = { messages: [], chatChannel: null };
  memory[guildId].messages.push({ content: message, time: Date.now() });
  // keep only messages from last 24h
  memory[guildId].messages = memory[guildId].messages.filter(
    m => Date.now() - m.time < 24 * 60 * 60 * 1000
  );
  fs.writeFileSync(dbPath, JSON.stringify(memory));
}

// Get a random message
export function getRandomMessage(guildId) {
  if (!memory[guildId] || memory[guildId].messages.length === 0) return null;
  const msgs = memory[guildId].messages;
  return msgs[Math.floor(Math.random() * msgs.length)].content;
}

// Save preferred channel
export function saveChatChannel(guildId, channelId) {
  if (!memory[guildId]) memory[guildId] = { messages: [], chatChannel: null };
  memory[guildId].chatChannel = channelId;
  fs.writeFileSync(dbPath, JSON.stringify(memory));
}

// Get preferred channel
export function getChatChannel(guildId) {
  return memory[guildId]?.chatChannel || null;
}

// Admin view/clear
export function getMessages(guildId) {
  return memory[guildId]?.messages || [];
}
export function clearMessages(guildId) {
  if (memory[guildId]) memory[guildId].messages = [];
  fs.writeFileSync(dbPath, JSON.stringify(memory));
}
