import { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } from 'discord.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Set up file path for the local GIF
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_GIF_PATH = path.join(__dirname, '../../assets/secret.gif');

// Secret message
const SECRET_MESSAGE = 'you have been *smacks lips* raped.';

export const data = new SlashCommandBuilder()
  .setName('rape')
  .setDescription('fire ass command')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('User to send the GIF to')
      .setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild); // Admin only

export async function execute(interaction) {
  const targetUser = interaction.options.getUser('user');

  try {
    const attachment = new AttachmentBuilder(LOCAL_GIF_PATH, { name: 'secret.gif' });

    await interaction.reply({
      content: `:shushing_face: <@${targetUser.id}> — ${SECRET_MESSAGE}`,
      files: [attachment],
    });
  } catch (err) {
    console.error('❌ Error sending local GIF:', err);
    await interaction.reply({
      content: '❌ Failed to send the local GIF in this channel.',
      ephemeral: true,
    });
  }
}
