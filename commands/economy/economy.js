// commands/economy/economy.js
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('economy')
    .setDescription('Overview of all economy commands'),
  async execute(interaction) {
    await interaction.reply({
      embeds: [
        {
          title: '💰 Economy System Help',
          color: 0xFFD700,
          description: 'Here are all the available economy commands:',
          fields: [
            {
              name: '/balance',
              value: 'Check your coin balance and XP.',
            },
            {
              name: '/daily',
              value: 'Claim your daily coins.',
            },
            {
              name: '/buy [item]',
              value: 'Buy an item from the shop.',
            },
            {
              name: '/shop',
              value: 'View available items to buy.',
            },
            {
              name: '/leaderboard',
              value: 'View the top users by coins or XP.',
            },
            {
              name: '/blackjack',
              value: 'Play blackjack to win or lose coins.',
            },
            {
              name: '/coinflip',
              value: 'Flip a coin and bet on heads or tails.',
            }
          ],
          footer: {
            text: 'Use each command with / to get more help on them!',
          },
        },
      ],
      ephemeral: true,
    });
  },
};
