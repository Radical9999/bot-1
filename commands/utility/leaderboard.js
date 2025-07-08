
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { db } = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show top users by XP or Coins')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Choose what to rank')
        .setRequired(true)
        .addChoices(
          { name: 'XP', value: 'xp' },
          { name: 'Coins', value: 'coins' }
        )
    ),

  async execute(interaction) {
    const type = interaction.options.getString('type');
    const users = db.get('users').value();

    const sorted = users
      .filter(u => u[type] !== undefined)
      .sort((a, b) => b[type] - a[type])
      .slice(0, 10);

    const leaderboard = await Promise.all(sorted.map(async (user, index) => {
      try {
        const member = await interaction.client.users.fetch(user.id);
        return `\`#${index + 1}\` ${member.tag} — **${user[type]} ${type}**`;
      } catch {
        return `\`#${index + 1}\` Unknown User — **${user[type]} ${type}**`;
      }
    }));

    const embed = new EmbedBuilder()
      .setColor(0x00BFFF)
      .setTitle(`🏆 Top ${type === 'xp' ? 'XP' : 'Coins'} Earners`)
      .setDescription(leaderboard.join('\n') || 'No data found.')
      .setFooter({ text: 'Use the bot often to climb the leaderboard!' });

    await interaction.reply({ embeds: [embed] });
  }
};
