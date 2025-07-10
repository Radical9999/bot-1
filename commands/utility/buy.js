import { SlashCommandBuilder } from 'discord.js';
import { db } from '../../db.js';

export const data = new SlashCommandBuilder()
  .setName('buy')
  .setDescription('Buy an item from the shop')
  .addStringOption(opt =>
    opt.setName('item').setDescription('Item name').setRequired(true)
  );

export async function execute(interaction) {
  const itemName = interaction.options.getString('item').toLowerCase();
  const shop = await db.get('shop') || [];
  const item = shop.find(i => i.name.toLowerCase() === itemName);

  if (!item) {
    return interaction.reply({ content: `❌ Item "${itemName}" not found.`, flags: 64 });
  }

  const users = await db.get('users');
  let user = users.find(u => u.id === interaction.user.id);

  if (!user) {
    user = { id: interaction.user.id, coins: 0, xp: 0, level: 0, inventory: [] };
    users.push(user);
  }

  if (user.coins < item.price) {
    return interaction.reply({ content: `💸 You need ${item.price} coins to buy that.`, flags: 64 });
  }

  user.coins -= item.price;
  user.inventory = user.inventory || [];
  user.inventory.push(item.name);
  await db.set('users', users);

  return interaction.reply({ content: `✅ You purchased **${item.name}** for ${item.price} coins!`, flags: 64 });
}
