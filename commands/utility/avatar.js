import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('avatar')
  .setDescription("Displays a user's avatar")
  .addUserOption(option =>
    option.setName('user')
      .setDescription('Select a user')
      .setRequired(false));

export async function execute(interaction) {
  const user = interaction.options.getUser('user') || interaction.user;
  await interaction.reply({ content: user.displayAvatarURL({ size: 1024 }), ephemeral: false });
}
