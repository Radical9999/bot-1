import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('banner')
  .setDescription("Shows the user's banner")
  .addUserOption(option =>
    option.setName('user')
      .setDescription('The user to get banner from')
      .setRequired(false));

export async function execute(interaction) {
  const member = interaction.options.getUser('user') || interaction.user;
  const user = await interaction.client.users.fetch(member.id, { force: true });
  if (!user.banner) return interaction.reply({ content: '❌ This user has no banner.', ephemeral: true });
  await interaction.reply({ content: user.bannerURL({ size: 2048 }), ephemeral: false });
}
