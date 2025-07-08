import { db } from './economy.js';

export async function handleXPAndCoins(userId) {
  const user = db.data.users[userId] || { xp: 0, level: 1, coins: 0 };
  const coinEarned = Math.floor(Math.random() * 11) + 5;
  const xpEarned = Math.floor(Math.random() * 11) + 5;
  user.coins += coinEarned;
  user.xp += xpEarned;

  const neededXP = user.level * 100;
  if (user.xp >= neededXP) {
    user.level++;
    user.xp -= neededXP;
  }

  db.data.users[userId] = user;
  await db.write();
}