import fs from 'fs';
import { REST, Routes } from 'discord.js';

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

const rest = new REST({ version: '10' }).setToken(config.token);

try {
  const result = await rest.put(
    Routes.applicationCommands(config.clientId),
    { body: [] } // Clear all global commands
  );
  console.log('✅ Cleared all global slash commands.');
} catch (error) {
  console.error('❌ Failed to clear global commands:', error);
}