// commands/economy/daily.js
import { SlashCommandBuilder } from 'discord.js';
import { db } from '../../db.js';

const cooldowns = new Map();

export const data = new SlashCommandBuilder()
  .setName('daily')
  .setDescription('Claim your daily coin reward');

export async function execute(interaction) {
  const userId = interaction.user.id;
  const now = Date.now();
  const lastClaim = cooldowns.get(userId) || 0;
  const cooldownTime = 24 * 60 * 60 * 1000; // 24 hours

  if (now - lastClaim < cooldownTime) {
    const remaining = cooldownTime - (now - lastClaim);
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return interaction.reply({
      content: `⏳ You can claim your next daily in ${hours}h ${minutes}m.`,
      ephemeral: true
    });
  }

  let users = await db.get('users');
  let user = users.find(u => u.id === userId);
  if (!user) {
    user = { id: userId, coins: 0 };
    users.push(user);
  }
  user.coins += 500;
  await db.set('users', users);
  cooldowns.set(userId, now);

  await interaction.reply({ content: '🎉 You claimed your daily 500 coins!', ephemeral: true });
}
