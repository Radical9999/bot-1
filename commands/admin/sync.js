
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Sync slash commands to all servers')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    try {
      await interaction.client.application.commands.set(interaction.client.commands.map(cmd => cmd.data));
      await interaction.reply('✅ Slash commands synced globally.');
    } catch (err) {
      console.error('Sync error:', err);
      await interaction.reply('❌ Failed to sync commands.');
    }
  }
};
