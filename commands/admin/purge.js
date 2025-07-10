import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Deletes a number of messages from a channel')
  .addIntegerOption(option =>
    option.setName('amount')
      .setDescription('Number of messages to delete (1-100)')
      .setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export async function execute(interaction) {
  const amount = interaction.options.getInteger('amount');
  if (amount < 1 || amount > 100) {
    return interaction.reply({ content: '❌ You must provide a number between 1 and 100.', ephemeral: true });
  }
  const messages = await interaction.channel.bulkDelete(amount, true);
  await interaction.reply({ content: `🧹 Deleted ${messages.size} messages.`, ephemeral: true });
}
