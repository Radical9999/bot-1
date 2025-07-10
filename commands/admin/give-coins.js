import { SlashCommandBuilder } from 'discord.js';
import { db } from '../../db.js';

export const data = new SlashCommandBuilder()
  .setName('give-coins')
  .setDescription('Give coins to a user')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('User to give coins to')
      .setRequired(true))
  .addIntegerOption(option =>
    option.setName('amount')
      .setDescription('Amount of coins to give')
      .setRequired(true));

export async function execute(interaction) {
  const target = interaction.options.getUser('user');
  const amount = interaction.options.getInteger('amount');
  const users = await db.get('users') || [];
  let userData = users.find(u => u.id === target.id);
  if (!userData) {
    userData = { id: target.id, coins: 0, xp: 0, level: 0 };
    users.push(userData);
  }
  userData.coins += amount;
  await db.set('users', users);
  await interaction.reply(`✅ Gave **${amount}** coins to ${target.tag}`);
}
