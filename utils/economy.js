// utils/economy.js
import { db } from '../db.js';

export async function getUserData(userId) {
  await db.read();
  if (!db.data.users[userId]) {
    db.data.users[userId] = {
      coins: 0,
      totalBet: 0,
      netGain: 0,
      xp: 0,
      level: 0,
      inventory: [],
    };
    await db.write();
  }
  return db.data.users[userId];
}

export async function updateCoins(userId, amount) {
  const user = await getUserData(userId);
  user.coins += amount;
  await db.write();
}

export async function updateXP(userId, amount) {
  const user = await getUserData(userId);
  user.xp += amount;

  const requiredXP = 100 + user.level * 25;
  if (user.xp >= requiredXP) {
    user.xp -= requiredXP;
    user.level++;
  }
  await db.write();
}

export async function buyItem(userId, itemName) {
  await db.read();
  const user = await getUserData(userId);
  const item = db.data.shop.find(i => i.name.toLowerCase() === itemName.toLowerCase());

  if (!item) return { success: false, message: 'Item not found' };
  if (user.coins < item.price) return { success: false, message: 'Not enough coins' };

  user.coins -= item.price;
  user.inventory.push(item.name);
  await db.write();
  return { success: true, message: `You bought **${item.name}**!` };
}

export async function getLeaderboard(type = 'coins', limit = 10) {
  await db.read();
  const users = Object.entries(db.data.users || {});
  const sorted = users.sort(([, a], [, b]) => (b[type] ?? 0) - (a[type] ?? 0)).slice(0, limit);
  return sorted.map(([id, data], i) => ({ rank: i + 1, id, ...data }));
}

export async function recordBet(userId, amount, outcome) {
  const user = await getUserData(userId);
  user.totalBet += amount;
  user.netGain += outcome;
  await db.write();
}
