import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { updateXP } from '../../utils/economy.js';

export default {
  data: new SlashCommandBuilder()
    .setName('xp-add')
    .setDescription('Add XP to a user')
    .addUserOption(opt => opt.setName('target').setDescription('User').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('XP amount').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const user = interaction.options.getUser('target');
    const amount = interaction.options.getInteger('amount');
    await updateXP(user.id, amount);
    await interaction.reply(`✅ Added ${amount} XP to <@${user.id}>`);
  }
};
