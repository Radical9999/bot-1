// commands/utility/serverinfo.js
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('Displays information about the current server');

export async function execute(interaction) {
  const { guild } = interaction;

  const embed = new EmbedBuilder()
    .setTitle(`📊 Server Info: ${guild.name}`)
    .setColor(0x00AE86)
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .addFields(
      { name: '📅 Created On', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
      { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
      { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
      { name: '🆔 Server ID', value: `${guild.id}`, inline: false }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
