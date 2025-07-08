import { SlashCommandBuilder, PermissionFlagsBits, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../');
const config = JSON.parse(fs.readFileSync(path.join(rootDir, 'config.json'), 'utf-8'));

export default {
  data: new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Sync slash commands to this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const commands = [];

    function getAllCommandFiles(dirPath, arrayOfFiles = []) {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
          getAllCommandFiles(fullPath, arrayOfFiles);
        } else if (file.endsWith('.js')) {
          arrayOfFiles.push(fullPath);
        }
      }
      return arrayOfFiles;
    }

    const commandFiles = getAllCommandFiles(path.join(rootDir, 'commands'));

    for (const file of commandFiles) {
      const command = await import(`file://${file}`);
      if (command.default?.data && command.default?.execute) {
        commands.push(command.default.data.toJSON());
      }
    }

    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, interaction.guildId),
        { body: commands }
      );

      await interaction.reply({ content: '✅ Commands synced to this server.', ephemeral: true });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Failed to sync commands.', ephemeral: true });
    }
  }
};
