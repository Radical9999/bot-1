import { SlashCommandBuilder } from 'discord.js';
import { db } from '../economy.js';

const COOLDOWN = 24 * 60 * 60 * 1000;
const REWARD = 250;
const timestamps = {};

export default {
  data: new SlashCommandBuilder().setName('daily').setDescription('Claim your daily reward'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const now = Date.now();
    const last = timestamps[userId] || 0;

    if (now - last < COOLDOWN) {
      const timeLeft = Math.ceil((COOLDOWN - (now - last)) / 1000);
      return await interaction.reply({ content: `⏳ You must wait ${timeLeft} seconds before claiming again.`, ephemeral: true });
    }

    timestamps[userId] = now;
    const user = db.data.users[userId] || { coins: 0 };
    user.coins += REWARD;
    db.data.users[userId] = user;
    await db.write();
    await interaction.reply(`🎉 You claimed your daily ${REWARD} coins! Your new balance is ${user.coins}.`);
  }
};