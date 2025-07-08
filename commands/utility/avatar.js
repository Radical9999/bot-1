import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get a user\'s avatar')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Select a user')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

    await interaction.reply({
      content: `${user.username}'s avatar: ${avatarUrl}`,
      ephemeral: false
    });
  }
};