import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('economy')
  .setDescription('Displays a list of economy-related commands');

export async function execute(interaction) {
  await interaction.reply({
    content: '💰 Use `/balance`, `/daily`, `/buy`, `/shop`, and more to interact with the economy system.',
    ephemeral: true
  });
}
