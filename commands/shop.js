import { SlashCommandBuilder } from 'discord.js';
import { db } from '../economy.js';

export default {
  data: new SlashCommandBuilder().setName('shop').setDescription('View shop items'),
  async execute(interaction) {
    const items = db.data.shop || [];
    const list = items.map(item => `**${item.name}** — ${item.price} coins`).join('\n');
    await interaction.reply({ content: list || 'Shop is empty.' });
  }
};