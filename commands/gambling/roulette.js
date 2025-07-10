import { SlashCommandBuilder } from 'discord.js';
import { db } from '../../db.js';

const colors = ['red', 'black', 'green'];

export const data = new SlashCommandBuilder()
  .setName('roulette')
  .setDescription('Bet on red, black, or green!')
  .addIntegerOption(opt =>
    opt.setName('amount')
      .setDescription('Coins to bet')
      .setRequired(true))
  .addStringOption(opt =>
    opt.setName('color')
      .setDescription('Pick a color')
      .setRequired(true)
      .addChoices(
        { name: 'Red (x2)', value: 'red' },
        { name: 'Black (x2)', value: 'black' },
        { name: 'Green (x14)', value: 'green' }));

export async function execute(interaction) {
  const userId = interaction.user.id;
  const amount = interaction.options.getInteger('amount');
  const color = interaction.options.getString('color');

  const users = await db.get('users') || [];
  const user = users.find(u => u.id === userId);

  if (!user || user.coins < amount || amount <= 0) {
    return interaction.reply({ content: '❌ Invalid bet or not enough coins.', ephemeral: true });
  }

  const roll = Math.random();
  let landed = roll < 0.475 ? 'red' : roll < 0.95 ? 'black' : 'green';
  let payout = 0;
  if (landed === color) {
    payout = color === 'green' ? amount * 14 : amount * 2;
    user.coins += payout;
  } else {
    user.coins -= amount;
  }
  await db.set('users', users);

  await interaction.reply(`🎰 Ball landed on **${landed}**. ${payout ? `You win **${payout}** coins!` : `You lose **${amount}** coins.`}`);
}
