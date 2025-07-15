// chatMemory.js
import db from 'jsoning';
const messageDB = new db('data/chatMemory.json');
const settingsDB = new db('data/settings.json');

// Validate a guild ID
function validateGuildId(guildId) {
  if (typeof guildId !== 'string' || !/^\d+$/.test(guildId)) {
    throw new TypeError('Invalid guildId');
  }
}

// Save a message
export async function saveMessage(guildId, message) {
  validateGuildId(guildId);
  if (!message || typeof message !== 'string' || !message.trim()) return;

  const now = Date.now();
  const saved = (await messageDB.get(guildId)) || [];
  if (!Array.isArray(saved)) return;

  saved.push({ content: message.trim(), timestamp: now });
  await messageDB.set(guildId, saved);

  const logChannelId = await getMemoryLogChannel(guildId);
  if (logChannelId) {
    const client = (await import('./index.js')).client;
    const channel = await client.channels.fetch(logChannelId).catch(() => null);
    if (channel?.isTextBased()) {
      channel.send(`💾 Saved: ${message.trim()}`).catch(() => {});
    }
  }
}

// Get all valid (not expired) messages
export async function getMessages(guildId) {
  validateGuildId(guildId);
  const now = Date.now();
  let messages = (await messageDB.get(guildId)) || [];
  if (!Array.isArray(messages)) messages = [];

  const valid = messages.filter(m => now - m.timestamp < 86400000 && m.content?.trim());
  await messageDB.set(guildId, valid);
  return valid.map(m => m.content.trim());
}

// Get a random valid message
export async function getRandomMessage(guildId) {
  const messages = await getMessages(guildId);
  if (messages.length === 0) return null;
  return messages[Math.floor(Math.random() * messages.length)];
}

// Clear saved messages
export async function clearMessages(guildId) {
  validateGuildId(guildId);
  await messageDB.set(guildId, []);
}

// Save/get chat channel (for bot to talk)
export async function saveChatChannel(guildId, channelId) {
  validateGuildId(guildId);
  await settingsDB.set(`${guildId}_chatChannel`, channelId);
}
export async function getChatChannel(guildId) {
  validateGuildId(guildId);
  return await settingsDB.get(`${guildId}_chatChannel`);
}

// Save/get log channel (for bot to log saved messages)
export async function saveMemoryLogChannel(guildId, channelId) {
  validateGuildId(guildId);
  await settingsDB.set(`${guildId}_memoryChannel`, channelId);
}
export async function getMemoryLogChannel(guildId) {
  validateGuildId(guildId);
  return await settingsDB.get(`${guildId}_memoryChannel`);
}