// Replace this:
// const { EmbedBuilder } = require('discord.js');
// const { db } = require('../db');

// With this:
import { EmbedBuilder } from 'discord.js';
import { db } from '../db.js'; // Add `.js` to avoid path issues

const cooldown = new Set();

export default async function handleMessageXP(message) {
  if (message.author.bot || !message.guild) return;

  if (cooldown.has(message.author.id)) return;
  cooldown.add(message.author.id);
  setTimeout(() => cooldown.delete(message.author.id), 30000);

  const xpGained = Math.floor(Math.random() * 10) + 5;
  const coinsGained = Math.floor(Math.random() * 5) + 1;

  let userData = db.get('users').find({ id: message.author.id });

  if (!userData.value()) {
    db.get('users')
      .push({ id: message.author.id, xp: xpGained, level: 0, coins: coinsGained })
      .write();
  } else {
    userData.update('xp', n => n + xpGained).update('coins', n => n + coinsGained).write();
  }

  userData = db.get('users').find({ id: message.author.id }).value();
  const levelUpXp = 100 + userData.level * 25;

  if (userData.xp >= levelUpXp) {
    db.get('users').find({ id: message.author.id })
      .update('level', n => n + 1)
      .update('xp', n => n - levelUpXp)
      .write();

    const levelEmbed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(`🌟 Level Up!`)
      .setDescription(`${message.author} reached **Level ${userData.level + 1}**!`)
      .setThumbnail(message.author.displayAvatarURL({ size: 256 }))
      .setFooter({ text: 'Keep chatting to level up more!' });

    message.channel.send({ embeds: [levelEmbed] });
  }
}