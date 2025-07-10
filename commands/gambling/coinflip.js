import { SlashCommandBuilder } from 'discord.js';
import { db } from '../../db.js';

export const data = new SlashCommandBuilder()
  .setName('coinflip')
  .setDescription('Flip a coin to win or lose coins')
  .addIntegerOption(opt =>
    opt.setName('amount')
      .setDescription('Coins to bet')
      .setRequired(true))
  .addStringOption(opt =>
    opt.setName('side')
      .setDescription('Choose heads or tails')
      .setRequired(true)
      .addChoices(
        { name: 'Heads', value: 'heads' },
        { name: 'Tails', value: 'tails' }
      ));

export async function execute(interaction) {
  const userId = interaction.user.id;
  const amount = interaction.options.getInteger('amount');
  const choice = interaction.options.getString('side');

  const users = await db.get('users') || [];
  const user = users.find(u => u.id === userId);

  if (!user || user.coins < amount || amount <= 0) {
    return interaction.reply({ content: '❌ Invalid bet or not enough coins.', ephemeral: true });
  }

  const result = Math.random() < 0.5 ? 'heads' : 'tails';
  const win = result === choice;
  user.coins += win ? amount : -amount;
  await db.set('users', users);

  await interaction.reply(`🪙 Coin landed on **${result}**. You ${win ? 'won' : 'lost'} **${amount}** coins.`);
}