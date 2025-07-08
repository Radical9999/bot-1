
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { db } = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give-coins')
    .setDescription('Give coins to a user.')
    .addUserOption(option =>
      option.setName('user').setDescription('The user to give coins to').setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount').setDescription('Amount of coins to give').setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    const userData = db.get('users').find({ id: user.id });

    if (!userData.value()) {
      db.get('users').push({ id: user.id, coins: amount, level: 0, xp: 0 }).write();
    } else {
      userData.update('coins', n => (n || 0) + amount).write();
    }

    await interaction.reply(`${amount} coins have been given to ${user.username}.`);
  }
};
