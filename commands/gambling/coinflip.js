import { SlashCommandBuilder } from 'discord.js';
import { db } from '../../db.js';

const cooldown = new Set();
const MAX_BET = 200000;

export default {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Gamble coins in a 50/50 coin flip')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of coins to bet (max 200,000)')
        .setRequired(true)),

  async execute(interaction) {
    const userId = interaction.user.id;
    const amount = interaction.options.getInteger('amount');

    if (cooldown.has(userId)) {
      return interaction.reply({ content: '⏳ You must wait 10 seconds before playing again.', ephemeral: true });
    }

    if (amount <= 0 || amount > MAX_BET) {
      return interaction.reply({ content: `❌ You can only bet between 1 and ${MAX_BET} coins.`, ephemeral: true });
    }

    let users = await db.get('users');
    let user = users.find(u => u.id === userId);

    if (!user || user.coins < amount) {

        user.totalBet = (user.totalBet || 0) + amount;
    if (user.initialCoins === undefined) user.initialCoins = user.coins;
      return interaction.reply({ content: '💸 You don\'t have enough coins.', ephemeral: true });
    }

    const win = Math.random() < 0.5;

    if (win) {
      user.coins += amount;
      await interaction.reply(`🎉 You **won** ${amount} coins! You now have **${user.coins}**.`);
    } else {
      user.coins -= amount;
      await interaction.reply(`😞 You **lost** ${amount} coins. You now have **${user.coins}**.`);
    }

    await db.set('users', users);
    cooldown.add(userId);
    setTimeout(() => cooldown.delete(userId), 10000);
  }
};