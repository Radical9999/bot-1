import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { db } from '../../db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('give-coins')
    .setDescription('Give coins to a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName('user').setDescription('User to give coins to').setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount').setDescription('Amount of coins to give').setRequired(true)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0) {
      return interaction.reply({ content: 'Amount must be greater than 0.', ephemeral: true });
    }

    let users = await db.get('users');
    let user = users.find(u => u.id === targetUser.id);

    if (!user) {
      user = { id: targetUser.id, coins: amount, xp: 0, level: 0 };
      users.push(user);
    } else {
      user.coins += amount;
    }

    await db.set('users', users);

    await interaction.reply(`✅ Gave **${amount} coins** to **${targetUser.username}**.`);
  }
};
