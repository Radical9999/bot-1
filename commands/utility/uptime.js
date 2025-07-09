import { SlashCommandBuilder } from 'discord.js';

let botStartTime = Date.now();

export function getUptime() {
  const diff = Date.now() - botStartTime;
  const seconds = Math.floor(diff / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Shows how long the bot has been running'),
  async execute(interaction) {
    await interaction.reply(`🕒 Bot has been running for **${getUptime()}**.`);
  }
};
