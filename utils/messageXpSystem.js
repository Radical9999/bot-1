import { EmbedBuilder } from 'discord.js';
import { db } from '../db.js';

const cooldown = new Set();

export default async function handleMessageXP(message) {
  if (message.author.bot || !message.guild) return;

  if (cooldown.has(message.author.id)) return;
  cooldown.add(message.author.id);
  setTimeout(() => cooldown.delete(message.author.id), 30000);

  const xpGained = Math.floor(Math.random() * 10) + 5;
  const coinsGained = Math.floor(Math.random() * 5) + 1;

  let users = await db.get('users');
  let user = users.find(u => u.id === message.author.id);

  if (!user) {
    user = { id: message.author.id, xp: xpGained, level: 0, coins: coinsGained };
    users.push(user);
  } else {
    user.xp += xpGained;
    user.coins += coinsGained;
  }

  const levelUpXp = 100 + user.level * 25;
  if (user.xp >= levelUpXp) {
    user.level += 1;
    user.xp -= levelUpXp;

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(`🌟 Level Up!`)
      .setDescription(`${message.author} reached **Level ${user.level}**!`)
      .setThumbnail(message.author.displayAvatarURL({ size: 256 }))
      .setFooter({ text: 'Keep chatting to level up more!' });

    message.channel.send({ embeds: [embed] });
  }

  await db.set('users', users);
}