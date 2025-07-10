import { SlashCommandBuilder } from 'discord.js';
import { db } from '../db.js';

export const data = new SlashCommandBuilder()
  .setName('level')
  .setDescription('Check your current level and XP');

export async function execute(interaction) {
  const users = await db.get('users') || [];
  let user = users.find(u => u.id === interaction.user.id);

  if (!user) {
    user = { id: interaction.user.id, coins: 0, xp: 0, level: 0, inventory: [] };
    users.push(user);
    await db.set('users', users);
  }

  return interaction.reply({
    content: `⭐ You are level **${user.level}** with **${user.xp} XP**.`,
    flags: 64
  });
}
