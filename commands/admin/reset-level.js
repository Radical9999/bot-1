import { SlashCommandBuilder } from 'discord.js';
import { db } from '../../db.js';

export const data = new SlashCommandBuilder()
  .setName('reset-level')
  .setDescription('Reset a user\'s level and XP')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('User to reset')
      .setRequired(true));

export async function execute(interaction) {
  const target = interaction.options.getUser('user');
  const users = await db.get('users') || [];
  const userData = users.find(u => u.id === target.id);
  if (!userData) return interaction.reply({ content: '❌ User not found.', ephemeral: true });
  userData.level = 0;
  userData.xp = 0;
  await db.set('users', users);
  await interaction.reply(`🔄 Reset level and XP for ${target.tag}`);
}
