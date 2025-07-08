import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Get a user\'s banner image')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Select a user')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const userFetched = await interaction.client.users.fetch(user.id, { force: true });

    if (!userFetched.banner) {
      return interaction.reply({
        content: `${user.username} does not have a banner.`,
        ephemeral: true
      });
    }

    const bannerURL = userFetched.bannerURL({ size: 1024, dynamic: true });

    await interaction.reply({
      content: `${user.username}'s banner: ${bannerURL}`,
      ephemeral: false
    });
  }
};