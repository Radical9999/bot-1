// /commands/context/exportsticker.js
import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  AttachmentBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import path from 'path';
import fs from 'fs';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

export const data = new ContextMenuCommandBuilder()
  .setName('Export Sticker')
  .setType(ApplicationCommandType.Message);

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    // Check if the bot can access the channel
    const channel = await interaction.client.channels.fetch(interaction.channelId);
    if (!channel) {
      return interaction.editReply({
        content: '❌ This bot must be in the server to export stickers.',
      });
    }

    // Fetch the message
    const message = await channel.messages.fetch(interaction.targetId);
    if (!message || !message.stickers || message.stickers.size === 0) {
      return interaction.editReply({
        content: '❌ This message does not contain any stickers.',
      });
    }

    const sticker = message.stickers.first();
    const isLottie = sticker.format === 3; // LOTTIE is not supported for export

    if (isLottie) {
      return interaction.editReply({
        content: '❌ Lottie stickers are animated vector and cannot be exported as an image/GIF.',
      });
    }

    const stickerUrl =
      sticker.format === 1 // PNG
        ? `https://cdn.discordapp.com/stickers/${sticker.id}.png`
        : `https://cdn.discordapp.com/stickers/${sticker.id}.gif`;

    const ext = sticker.format === 1 ? 'png' : 'gif';
    const response = await fetch(stickerUrl);
    if (!response.ok) throw new Error('Failed to download sticker');

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = `sticker-${uuidv4()}.${ext}`;
    const filePath = path.join(tmpdir(), filename);
    fs.writeFileSync(filePath, buffer);

    const file = new AttachmentBuilder(filePath, { name: filename });
    await interaction.editReply({
      content: `✅ Here's the exported sticker from ${message.author?.username || 'user'}:`,
      files: [file],
    });

    fs.unlinkSync(filePath);
  } catch (err) {
    console.error('❌ Error exporting sticker:', err);
    if (!interaction.replied) {
      await interaction.editReply({
        content: '❌ An error occurred while exporting the sticker.',
      });
    }
  }
}
