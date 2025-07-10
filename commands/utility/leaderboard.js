import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../../db.js';

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('Shows the top 10 richest users');

export async function execute(interaction) {
  const users = await db.get('users') || [];
  const sorted = users.sort((a, b) => b.coins - a.coins).slice(0, 10);

  const embed = new EmbedBuilder()
    .setTitle('🏆 Top 10 Richest Users')
    .setColor(0xFFD700)
    .setDescription(sorted.map((u, i) => `**${i + 1}.** <@${u.id}> — ${u.coins} coins`).join('\n'));

  await interaction.reply({ embeds: [embed] });
}