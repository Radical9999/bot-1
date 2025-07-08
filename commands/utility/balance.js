import { SlashCommandBuilder } from 'discord.js';
import { db } from '../economy.js';

export default {
  data: new SlashCommandBuilder().setName('balance').setDescription('Check your balance'),
  async execute(interaction) {
    const user = db.data.users[interaction.user.id] || { coins: 0 };
    await interaction.reply(`💰 You have ${user.coins} coins.`);
  }
};