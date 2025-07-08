
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Shows a user\'s profile banner')
    .addUserOption(option =>
      option.setName('user').setDescription('User to get banner of').setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const userFetched = await interaction.client.users.fetch(user.id, { force: true });

    if (!userFetched.banner) {
      return interaction.reply(`${user.username} has no banner set.`);
    }

    const bannerURL = userFetched.bannerURL({ size: 1024 });
    await interaction.reply({
      embeds: [
        {
          title: `${user.username}'s Banner`,
          image: { url: bannerURL }
        }
      ]
    });
  }
};
