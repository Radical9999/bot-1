import { SlashCommandBuilder } from 'discord.js';
import { db } from '../economy.js';

export default {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin and bet on the outcome')
    .addStringOption(opt => opt.setName('side').setDescription('Heads or Tails').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to bet').setRequired(true)),
  async execute(interaction) {
    const side = interaction.options.getString('side').toLowerCase();
    const amount = interaction.options.getInteger('amount');
    if (!['heads', 'tails'].includes(side)) return await interaction.reply('Choose heads or tails.');

    const user = db.data.users[interaction.user.id] || { coins: 0 };
    if (amount <= 0 || user.coins < amount)
      return await interaction.reply({ content: '❌ Invalid or insufficient funds.', ephemeral: true });

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const win = result === side;
    user.coins += win ? amount : -amount;
    db.data.users[interaction.user.id] = user;
    await db.write();
    await interaction.reply(`${win ? '🎉 You won!' : '😢 You lost.'} Coin landed on **${result}**. New balance: ${user.coins}`);
  }
};