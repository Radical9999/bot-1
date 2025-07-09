import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Shows server information'),
  async execute(interaction) {
    const { guild } = interaction;

    await interaction.reply({
      embeds: [{
        title: `${guild.name}`,
        thumbnail: { url: guild.iconURL({ size: 256 }) },
        fields: [
          { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
          { name: 'Members', value: `${guild.memberCount}`, inline: true },
          { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
        ]
      }]
    });
  }
};
