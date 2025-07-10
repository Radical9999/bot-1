import { SlashCommandBuilder } from 'discord.js';
import { db } from '../../db.js';

export const data = new SlashCommandBuilder()
  .setName('dice')
  .setDescription('Roll a dice against the bot')
  .addIntegerOption(opt =>
    opt.setName('amount')
      .setDescription('Coins to bet')
      .setRequired(true));

export async function execute(interaction) {
  const userId = interaction.user.id;
  const amount = interaction.options.getInteger('amount');

  const users = await db.get('users') || [];
  const user = users.find(u => u.id === userId);

  if (!user || user.coins < amount || amount <= 0) {
    return interaction.reply({ content: '❌ Invalid bet or not enough coins.', ephemeral: true });
  }

  const userRoll = Math.ceil(Math.random() * 6);
  const botRoll = Math.ceil(Math.random() * 6);
  let result = '';
  if (userRoll > botRoll) {
    user.coins += amount;
    result = `🎲 You rolled ${userRoll}, bot rolled ${botRoll}. You win **${amount}** coins!`;
  } else if (userRoll < botRoll) {
    user.coins -= amount;
    result = `🎲 You rolled ${userRoll}, bot rolled ${botRoll}. You lose **${amount}** coins.`;
  } else {
    result = `🎲 Both rolled ${userRoll}. It's a tie.`;
  }

  await db.set('users', users);
  await interaction.reply(result);
}
