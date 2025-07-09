// utils/messageXpSystem.js
import { EmbedBuilder } from 'discord.js';
import { db } from '../db.js'; // using jsoning

const cooldown = new Set();

export default async function handleMessageXP(message) {
  if (message.author.bot || !message.guild) return;

  const userId = message.author.id;

  if (cooldown.has(userId)) return;
  cooldown.add(userId);
  setTimeout(() => cooldown.delete(userId), 30000);

  // Load or initialize user data
  const users = (await db.get('users')) || [];
  let user = users.find(u => u.id === userId);

  if (!user) {
    user = {
      id: userId,
      coins: 0,
      totalBet: 0,
      netGain: 0,
      xp: 0,
      level: 0,
      inventory: [],
    };
    users.push(user);
  }

  // Add random XP and coins
  const xpGained = Math.floor(Math.random() * 10) + 5;
  const coinsGained = Math.floor(Math.random() * 5) + 1;
  user.xp += xpGained;
  user.coins += coinsGained;

  // Check level up
  const requiredXP = 100 + user.level * 25;
  const leveledUp = user.xp >= requiredXP;

  if (leveledUp) {
    user.xp -= requiredXP;
    user.level++;

    const levelEmbed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(`🌟 Level Up!`)
      .setDescription(`${message.author} reached **Level ${user.level}**!`)
      .setThumbnail(message.author.displayAvatarURL({ size: 256 }))
      .setFooter({ text: 'Keep chatting to level up more!' });

    try {
      await message.channel.send({ embeds: [levelEmbed] });
    } catch (err) {
      console.warn(`⚠️ Couldn't send in channel: ${err.message}`);
      try {
        await message.author.send({ embeds: [levelEmbed] });
      } catch (dmErr) {
        console.error(`❌ Failed to DM ${message.author.tag}: ${dmErr.message}`);
      }
    }
  }

  // Save updated user list
  await db.set('users', users);
}