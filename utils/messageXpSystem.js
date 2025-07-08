import { EmbedBuilder } from 'discord.js';
import { db } from '../db.js';

const cooldown = new Set();

export default async function handleMessageXP(message) {
  if (message.author.bot || !message.guild) return;

  if (cooldown.has(message.author.id)) return;
  cooldown.add(message.author.id);
  setTimeout(() => cooldown.delete(message.author.id), 30000);

  await db.read();

  const userId = message.author.id;
  if (!db.data.users[userId]) {
    db.data.users[userId] = {
      coins: 0,
      totalBet: 0,
      netGain: 0,
      xp: 0,
      level: 0,
      inventory: [],
    };
  }

  const user = db.data.users[userId];
  const xpGained = Math.floor(Math.random() * 10) + 5;
  const coinsGained = Math.floor(Math.random() * 5) + 1;

  user.xp += xpGained;
  user.coins += coinsGained;

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

  await db.write();
}