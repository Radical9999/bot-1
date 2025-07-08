// commands/utility/balance.js
import { SlashCommandBuilder } from 'discord.js';
import { getUserData } from '../../utils/economy.js';

export default {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('View your current coin balance, total bet, and net gain'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const userData = await getUserData(userId);

    const embed = {
      color: 0xFFD700,
      title: `${interaction.user.username}'s Balance`,
      fields: [
        { name: '💰 Coins', value: `${userData.coins}`, inline: true },
        { name: '🎲 Total Bet', value: `${userData.totalBet}`, inline: true },
        { name: '📈 Net Gain', value: `${userData.netGain}`, inline: true },
      ],
      footer: { text: 'Use /gamble to try your luck!' },
    };

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};