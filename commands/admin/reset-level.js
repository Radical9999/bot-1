import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { db } from '../../db.js';

export const data = new SlashCommandBuilder()
  .setName('reset-level')
  .setDescription("Reset a user's level and XP")
  .addUserOption(option =>
    option.setName('user')
      .setDescription('User to reset')
      .setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild); // Only admins by default

export async function execute(interaction) {
  // Runtime permission check as backup
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({
      content: '❌ You need the **Manage Server** permission to use this command.',
      ephemeral: true
    });
  }

  const target = interaction.options.getUser('user');
  const users = await db.get('users') || [];
  const userData = users.find(u => u.id === target.id);

  if (!userData) {
    return interaction.reply({ content: '❌ User not found in database.', ephemeral: true });
  }

  userData.level = 0;
  userData.xp = 0;
  await db.set('users', users);

  await interaction.reply(`🔄 Reset level and XP for **${target.tag}**.`);
}
