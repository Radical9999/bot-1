
const { SlashCommandBuilder } = require('discord.js');
const { db } = require('../../db');

const cooldowns = new Map();

module.exports = {
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

    const coins = 100;
    const xp = 25;
    let userData = db.get('users').find({ id: userId });

    if (!userData.value()) {
      db.get('users').push({ id: userId, coins, xp, level: 0 }).write();
    } else {
      userData.update('coins', n => n + coins).update('xp', n => n + xp).write();
    }

    cooldowns.set(userId, now);
    await interaction.reply(`✅ You received **${coins} coins** and **${xp} XP**!`);
  }
};
