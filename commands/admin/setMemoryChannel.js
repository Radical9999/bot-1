// /commands/admin/setMemoryChannel.js
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import db from 'jsoning';

const settingsDB = new db('data/settings.json');

export const data = new SlashCommandBuilder()
  .setName('setmemorychannel')
  .setDescription('Set the channel where saved messages will be logged')
  .addChannelOption(option =>
    option.setName('channel').setDescription('Channel to store saved messages').setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel');
  await settingsDB.set(`${interaction.guild.id}_memoryChannel`, channel.id);
  await interaction.reply({ content: `✅ Saved messages will be sent to <#${channel.id}>`, ephemeral: true });
}
