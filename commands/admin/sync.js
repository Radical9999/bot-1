import { SlashCommandBuilder } from 'discord.js';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../../config.json' assert { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const data = new SlashCommandBuilder()
  .setName('sync')
  .setDescription('Sync all global commands (admin only)');

export async function execute(interaction) {
  if (interaction.user.id !== config.ownerId) {
    return interaction.reply({ content: '❌ You do not have permission to use this.', ephemeral: true });
  }

  const commands = [];
  const walk = dir => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) walk(fullPath);
      else if (file.endsWith('.js')) {
        const command = require(fullPath);
        if (command.data) commands.push(command.data.toJSON());
      }
    }
  };
  walk(path.join(__dirname, '../'));

  const rest = new REST({ version: '10' }).setToken(config.token);
  try {
    await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
    await interaction.reply('✅ Synced all commands globally.');
  } catch (err) {
    await interaction.reply({ content: '❌ Failed to sync commands.', ephemeral: true });
  }
}
