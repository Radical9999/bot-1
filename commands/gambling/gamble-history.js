// commands/gambling/gamble-history.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../../db.js';

export const data = new SlashCommandBuilder()
  .setName('gamble-history')
  .setDescription('Shows your total bets and net gain/loss from gambling');

export async function execute(interaction) {
  const userId = interaction.user.id;
  const users = await db.get('users') || [];
  const user = users.find(u => u.id === userId);

  if (!user || (!user.totalBet && !user.netGain)) {
    return interaction.reply({
      content: '❌ No gambling history found.',
      ephemeral: true
    });
  }

  const embed = new EmbedBuilder()
    .setTitle('🎲 Gambling History')
    .setColor(0x3498db)
    .addFields(
      { name: 'Total Bet', value: `${user.totalBet || 0} coins`, inline: true },
      { name: 'Net Gain/Loss', value: `${user.netGain >= 0 ? '+' : ''}${user.netGain || 0} coins`, inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
