import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../../db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('gamble-history')
    .setDescription('View your total coins bet and how much you are up/down'),

  async execute(interaction) {
    const userId = interaction.user.id;

    let users = await db.get('users');
    let user = users.find(u => u.id === userId);

    if (!user) {
      return interaction.reply({ content: '❌ You have no gambling history.', ephemeral: true });
    }

    const totalBet = user.totalBet || 0;
    const coins = user.coins || 0;
    const initialCoins = user.initialCoins || 0;

    const profit = coins - (initialCoins || 0);
    const profitDisplay = profit >= 0
      ? `🟢 You are **up ${profit}** coins!`
      : `🔴 You are **down ${Math.abs(profit)}** coins.`;

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username}'s Gambling History`)
      .addFields(
        { name: 'Total Coins Bet', value: `${totalBet}`, inline: true },
        { name: 'Current Coins', value: `${coins}`, inline: true },
        { name: 'Net Profit', value: profit >= 0 ? `+${profit}` : `${profit}`, inline: true },
      )
      .setDescription(profitDisplay)
      .setColor(profit >= 0 ? 0x00ff00 : 0xff0000)
      .setFooter({ text: 'Keep gambling responsibly.' });

    await interaction.reply({ embeds: [embed] });
  }
};