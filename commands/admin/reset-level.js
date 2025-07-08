import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { db } from '../../db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reset-level')
    .setDescription('Reset a user\'s XP and level')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User whose level to reset')
        .setRequired(true)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');

    let users = await db.get('users');
    let user = users.find(u => u.id === targetUser.id);

    if (!user) {
      return interaction.reply({ content: 'User not found in database.', ephemeral: true });
    }

    user.level = 0;
    user.xp = 0;

    await db.set('users', users);
    await interaction.reply(`🔁 Reset **${targetUser.username}**'s level and XP.`);
  }
};