// /commands/admin/setTalkChannel.js
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import db from 'jsoning';

const settingsDB = new db('data/settings.json');

export const data = new SlashCommandBuilder()
  .setName('settalkchannel')
  .setDescription('Set the channel where the bot will randomly talk')
  .addChannelOption(option =>
    option.setName('channel').setDescription('Channel to talk in').setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const channel = interaction.options.getChannel('channel');
  await settingsDB.set(`${interaction.guild.id}_talkChannel`, channel.id);
  await interaction.reply({ content: `✅ Bot will now talk in <#${channel.id}>`, ephemeral: true });
}
