// clearGuildCommands.js
import { REST, Routes } from 'discord.js';
import config from './config.json' assert { type: 'json' };

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    const guildCommands = await rest.get(
      Routes.applicationGuildCommands(config.clientId, config.devGuildId)
    );

    for (const command of guildCommands) {
      await rest.delete(
        Routes.applicationGuildCommand(config.clientId, config.devGuildId, command.id)
      );
      console.log(`🗑️ Deleted guild command: ${command.name}`);
    }

    console.log('✅ All guild commands cleared.');
  } catch (err) {
    console.error('❌ Failed to clear guild commands:', err);
  }
})();
