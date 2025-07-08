import { SlashCommandBuilder } from 'discord.js';
import { db } from '../../db.js';

const cooldown = new Set();
const MAX_BET = 200000;

export default {
  data: new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('Bet on red or black and spin the roulette wheel')
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Choose red or black')
        .addChoices(
          { name: 'Red', value: 'red' },
          { name: 'Black', value: 'black' }
        )
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Coins to bet (max 200,000)')
        .setRequired(true)),

  async execute(interaction) {
    const userId = interaction.user.id;
    const color = interaction.options.getString('color');
    const amount = interaction.options.getInteger('amount');

    if (cooldown.has(userId)) {
      return interaction.reply({ content: '⏳ You must wait 10 seconds before playing again.', ephemeral: true });
    }

    if (amount <= 0 || amount > MAX_BET) {
      return interaction.reply({ content: `❌ You must bet between 1 and ${MAX_BET} coins.`, ephemeral: true });
    }

    let users = await db.get('users');
    let user = users.find(u => u.id === userId);

    if (!user || user.coins < amount) {

        user.totalBet = (user.totalBet || 0) + amount;
    if (user.initialCoins === undefined) user.initialCoins = user.coins;
      return interaction.reply({ content: '💸 You do not have enough coins.', ephemeral: true });
    }

    const outcome = Math.random() < 0.5 ? 'red' : 'black';

    let message = `🎡 The wheel spins... it's **${outcome.toUpperCase()}**!
`;
    if (color === outcome) {
      user.coins += amount;
      message += `🎉 You won **${amount}** coins!`;
    } else {
      user.coins -= amount;
      message += `😢 You lost **${amount}** coins.`;
    }

    await db.set('users', users);
    cooldown.add(userId);
    setTimeout(() => cooldown.delete(userId), 10000);

    message += `
You now have **${user.coins}** coins.`;
    await interaction.reply({ content: message });
  }
};