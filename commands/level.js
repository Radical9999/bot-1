import { SlashCommandBuilder } from 'discord.js';
import { db } from '../economy.js';

export default {
  data: new SlashCommandBuilder().setName('level').setDescription('Check your level and XP'),
  async execute(interaction) {
    const user = db.data.users[interaction.user.id] || { xp: 0, level: 1 };
    await interaction.reply(`🧬 Level: ${user.level}, XP: ${user.xp}`);
  }
};