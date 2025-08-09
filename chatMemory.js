// ✅ chatMemory.js (updated with chatbot toggles)
import Jsoning from 'jsoning';
const db = new Jsoning("./data/chatMemory.json");

export async function saveMessage(guildId, content) {
  if (!guildId || !content?.trim()) return;
  const data = (await db.get(guildId)) || { messages: [] };
  data.messages = data.messages || [];
  data.messages.push({ content: content.trim(), timestamp: Date.now() });
  await db.set(guildId, data);
}

export async function getRandomMessage(guildId) {
  const data = await db.get(guildId);
  const messages = data?.messages || [];
  const recent = messages.filter(m => Date.now() - m.timestamp < 24 * 60 * 60 * 1000);
  if (!recent.length) return null;
  const random = recent[Math.floor(Math.random() * recent.length)];
  return random.content;
}

export async function getChatChannel(guildId) {
  const data = await db.get(guildId);
  return data?.chatChannelId || null;
}

export async function getMemoryLogChannel(guildId) {
  const data = await db.get(guildId);
  return data?.logChannelId || null;
}

export async function isChatbotEnabled(guildId) {
  const settings = (await db.get(guildId)) || {};
  return settings.chatbotEnabled ?? true;
}

export async function toggleChatbot(guildId) {
  const settings = (await db.get(guildId)) || {};
  settings.chatbotEnabled = !settings.chatbotEnabled;
  await db.set(guildId, settings);
  return settings.chatbotEnabled;
}

export async function isRandomReplyEnabled(guildId) {
  const settings = (await db.get(guildId)) || {};
  return settings.randomRepliesEnabled ?? true;
}

export async function toggleRandomReplies(guildId) {
  const settings = (await db.get(guildId)) || {};
  settings.randomRepliesEnabled = !settings.randomRepliesEnabled;
  await db.set(guildId, settings);
  return settings.randomRepliesEnabled;
}
