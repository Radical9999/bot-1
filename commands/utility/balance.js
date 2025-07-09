// commands/utility/balance.js
import { SlashCommandBuilder } from 'discord.js';
import { db } from '../../db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your balance'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const users = await db.get('users') || [];
    let userData = users.find(u => u.id === userId);

    if (!userData) {
      userData = { id: userId, coins: 0, xp: 0, level: 0 };
      users.push(userData);
      await db.set('users', users);
    }

    await interaction.reply({
      content: `💰 You have **${userData.coins}** coins.`,
      flags: 64, // ephemeral = true replacement
    });
  }
};
