
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Shows a user\'s profile picture')
    .addUserOption(option =>
      option.setName('user').setDescription('User to get avatar of').setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    await interaction.reply({
      embeds: [
        {
          title: `${user.username}'s Avatar`,
          image: { url: user.displayAvatarURL({ size: 1024 }) }
        }
      ]
    });
  }
};
