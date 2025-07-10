import { SlashCommandBuilder } from 'discord.js';
import { db } from '../../db.js';

const items = ['🍒', '🍋', '🔔', '🍀', '💎'];

export const data = new SlashCommandBuilder()
  .setName('slots')
  .setDescription('Play the slot machine')
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

  const spin = () => [0, 0, 0].map(() => items[Math.floor(Math.random() * items.length)]);
  const result = spin();
  let payout = 0;

  if (result.every(s => s === result[0])) {
    payout = amount * 10;
  } else if (new Set(result).size === 2) {
    payout = amount * 2;
  }

  user.coins += payout - amount;
  await db.set('users', users);

  await interaction.reply(`🎰 ${result.join(' | ')}
${payout ? `🎉 You win **${payout}** coins!` : `😢 You lost **${amount}** coins.`}`);
}