import { SlashCommandBuilder } from 'discord.js';
import { db } from '../economy.js';

export default {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Buy an item from the shop')
    .addStringOption(opt => opt.setName('item').setDescription('Item name').setRequired(true)),
  async execute(interaction) {
    const itemName = interaction.options.getString('item');
    const item = db.data.shop.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (!item) return await interaction.reply({ content: '❌ Item not found.', ephemeral: true });

    const user = db.data.users[interaction.user.id] || { coins: 0 };
    if (user.coins < item.price) return await interaction.reply({ content: '❌ Not enough coins.', ephemeral: true });

    user.coins -= item.price;
    db.data.users[interaction.user.id] = user;
    await db.write();
    await interaction.reply(`✅ You bought **${item.name}** for ${item.price} coins. New balance: ${user.coins}`);
  }
};