import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete messages from a channel')
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Number of messages to delete')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    if (amount < 1 || amount > 100) {
      return await interaction.reply({ content: 'Please provide a number between 1 and 100.', ephemeral: true });
    }

    const deleted = await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({ content: `🧹 Deleted ${deleted.size} messages.`, ephemeral: true });
  }
};
