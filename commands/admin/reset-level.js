
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset-level')
    .setDescription('Reset a user\'s level and XP.')
    .addUserOption(option =>
      option.setName('user').setDescription('The user to reset').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const userData = db.get('users').find({ id: user.id });

    if (!userData.value()) {
      return interaction.reply({ content: `${user.username} has no data to reset.`, ephemeral: true });
    }

    userData.assign({ xp: 0, level: 0 }).write();
    await interaction.reply(`${user.username}'s level and XP have been reset.`);
  }
};
