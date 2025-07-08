import { SlashCommandBuilder } from 'discord.js';
import { db } from '../economy.js';

export default {
  data: new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('Gamble your coins (50/50 chance)')
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to gamble').setRequired(true)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const user = db.data.users[interaction.user.id] || { coins: 0 };
    if (amount <= 0 || user.coins < amount)
      return await interaction.reply({ content: '❌ Invalid or insufficient funds.', ephemeral: true });

    const win = Math.random() < 0.5;
    user.coins += win ? amount : -amount;
    db.data.users[interaction.user.id] = user;
    await db.write();
    await interaction.reply(`${win ? '🎉 You won!' : '😢 You lost.'} Your new balance is ${user.coins} coins.`);
  }
};