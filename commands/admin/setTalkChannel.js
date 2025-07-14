// /commands/admin/setchatchannel.js
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { saveChatChannel } from '../../chatMemory.js';

export const data = new SlashCommandBuilder()
  .setName('setchatchannel')
  .setDescription('Set the channel where the bot is allowed to randomly talk')
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('The channel for the bot to talk in')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel');
  saveChatChannel(interaction.guildId, channel.id);
  await interaction.reply({
    content: `✅ Chat channel set to ${channel}`,
    ephemeral: true
  });
}
