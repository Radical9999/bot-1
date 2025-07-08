import { SlashCommandBuilder } from 'discord.js';
import { db } from '../../db.js';

const cooldown = new Set();
const MAX_BET = 200000;
const symbols = ['🍒', '🍋', '🍉', '7️⃣'];

function spin() {
  return [0, 1, 2].map(() => symbols[Math.floor(Math.random() * symbols.length)]);
}

export default {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Play the slot machine and try your luck')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Bet amount (max 200,000)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('amount');

    if (cooldown.has(userId)) {
      return interaction.reply({ content: '⏳ Please wait 10 seconds before playing again.', ephemeral: true });
    }

    if (bet <= 0 || bet > MAX_BET) {
      return interaction.reply({ content: `❌ Bet must be between 1 and ${MAX_BET}.`, ephemeral: true });
    }

    let users = await db.get('users');
    let user = users.find(u => u.id === userId);

    if (!user || user.coins < bet) {
      return interaction.reply({ content: '💸 You do not have enough coins.', ephemeral: true });
    }

    const result = spin();
    const win = result.every(symbol => symbol === result[0]);

    let message = `🎰 **[ ${result.join(' ')} ]**
`;

    if (win) {
      const winnings = bet * 3;
      user.coins += winnings;
      message += `🎉 Jackpot! You won **${winnings}** coins!`;
    } else {
      user.coins -= bet;
      message += `😢 You lost **${bet}** coins.`;
    }

    await db.set('users', users);
    cooldown.add(userId);
    setTimeout(() => cooldown.delete(userId), 10000);

    message += `
You now have **${user.coins}** coins.`;
    await interaction.reply({ content: message });
  }
};