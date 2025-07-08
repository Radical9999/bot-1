import { SlashCommandBuilder } from 'discord.js';
import { db } from '../../db.js';

const cooldowns = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward!'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const now = Date.now();
    const cooldown = cooldowns.get(userId);

    if (cooldown && now - cooldown < 86400000) {
      const timeLeft = 86400000 - (now - cooldown);
      const hours = Math.floor(timeLeft / 3600000);
      const minutes = Math.floor((timeLeft % 3600000) / 60000);
      return interaction.reply(`⏳ You already claimed your daily. Come back in **${hours}h ${minutes}m**.`);
    }

    let users = await db.get('users');
    let user = users.find(u => u.id === userId);

    if (!user) {
      user = { id: userId, xp: 25, level: 0, coins: 100 };
      users.push(user);
    } else {
      user.xp += 25;
      user.coins += 100;
    }

    await db.set('users', users);
    cooldowns.set(userId, now);
    await interaction.reply(`✅ You received **100 coins** and **25 XP**!`);
  }
}