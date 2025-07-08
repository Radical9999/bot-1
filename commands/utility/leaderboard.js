import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { db } from '../../db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show top users by XP or coins')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Leaderboard type')
        .addChoices(
          { name: 'XP', value: 'xp' },
          { name: 'Coins', value: 'coins' }
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    const type = interaction.options.getString('type');
    const users = await db.get('users');

    const sorted = [...users].sort((a, b) => (b[type] || 0) - (a[type] || 0)).slice(0, 10);

    if (sorted.length === 0) {
      return interaction.reply({ content: `No users found for ${type} leaderboard.`, ephemeral: true });
    }

    const leaderboard = sorted.map((user, index) => {
      const value = user[type] || 0;
      return `\`#${index + 1}\` <@${user.id}> — **${value} ${type === 'xp' ? 'XP' : 'coins'}**`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`${type === 'xp' ? '🏆 XP Leaderboard' : '💰 Coin Leaderboard'}`)
      .setDescription(leaderboard)
      .setColor(0xFFD700)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};