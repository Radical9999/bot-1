import { SlashCommandBuilder } from 'discord.js';
import { db } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('shop')
  .setDescription('View available shop items');

export async function execute(interaction) {
  const shop = await db.get('shop') || [];
  if (shop.length === 0) {
    return interaction.reply({ content: '🛒 The shop is currently empty.', flags: 64 });
  }

  const lines = shop.map(it => `• **${it.name}** — ${it.price} coins`);
  return interaction.reply({ content: `🛒 Available items:\n${lines.join('\n')}`, flags: 64 });
}
