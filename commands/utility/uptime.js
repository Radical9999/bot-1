import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('uptime')
  .setDescription('Displays how long the bot has been online');

export async function execute(interaction) {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  await interaction.reply(`🕒 Uptime: ${hours}h ${minutes}m ${seconds}s`);
}