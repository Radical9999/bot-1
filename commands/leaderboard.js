import { SlashCommandBuilder } from 'discord.js';
import { db } from '../economy.js';

export default {
  data: new SlashCommandBuilder().setName('leaderboard').setDescription('Show top users by coins'),
  async execute(interaction) {
    const users = Object.entries(db.data.users || {})
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.coins - a.coins)
      .slice(0, 10);

    const list = users.map((u, i) => `#${i+1} <@${u.id}> — ${u.coins} coins`).join('\n');
    await interaction.reply({ content: `🏆 **Leaderboard**:\n${list}`, allowedMentions: { parse: [] } });
  }
};