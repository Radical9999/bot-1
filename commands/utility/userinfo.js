import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Displays information about a user')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('The user to get info about')
      .setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('user') || interaction.user;
  const member = await interaction.guild.members.fetch(user.id);
  const embed = new EmbedBuilder()
    .setTitle(`${user.username}'s Info`)
    .setThumbnail(user.displayAvatarURL({ size: 512 }))
    .addFields(
      { name: 'ID', value: user.id, inline: true },
      { name: 'Username', value: user.tag, inline: true },
      { name: 'Joined Server', value: new Date(member.joinedTimestamp).toLocaleString(), inline: true },
      { name: 'Account Created', value: new Date(user.createdTimestamp).toLocaleString(), inline: true }
    )
    .setColor(0x3498db);

  await interaction.reply({ embeds: [embed] });
}