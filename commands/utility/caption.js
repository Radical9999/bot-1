// /commands/utility/caption.js
import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { GifCodec, GifFrame } from 'gifwrap';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Jimp = require('jimp');

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commandData = new SlashCommandBuilder()
  .setName('caption')
  .setDescription('Adds a caption to a GIF or image')
  .addAttachmentOption(option =>
    option.setName('file')
      .setDescription('Upload an image or animated GIF')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('text')
      .setDescription('Text to add as caption')
      .setRequired(true));

async function execute(interaction) {
  const attachment = interaction.options.getAttachment('file');
  const captionText = interaction.options.getString('text');

  if (!attachment || !attachment.url) {
    return interaction.reply({ content: '❌ You must upload an image or gif file.', flags: 64 });
  }

  const fileUrl = attachment.url;
  const fileExt = path.extname(fileUrl).toLowerCase();
  const tempPath = path.join(tmpdir(), `${uuidv4()}${fileExt}`);

  try {
    // Download the file
    const response = await fetch(fileUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(tempPath, buffer);

    if (fileExt === '.gif') {
      // Animated GIF support
      const codec = new GifCodec();
      const gif = await codec.decodeGif(buffer);
      const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
      const modifiedFrames = [];

      for (const frame of gif.frames) {
        const jimpImage = await Jimp.read(frame.bitmap);
        jimpImage.print(font, 10, jimpImage.bitmap.height - 30, captionText);
        const modifiedFrame = new GifFrame(jimpImage.bitmap, {
          delayCentisecs: frame.delayCentisecs,
          disposalMethod: frame.disposalMethod,
        });
        modifiedFrames.push(modifiedFrame);
      }

      const encoded = await codec.encodeGif(modifiedFrames, { loops: gif.loops });
      const outPath = path.join(tmpdir(), `${uuidv4()}.gif`);
      fs.writeFileSync(outPath, encoded.buffer);

      const file = new AttachmentBuilder(outPath, { name: 'captioned.gif' });
      await interaction.reply({ files: [file] });

      fs.unlinkSync(outPath);
    } else {
      // Static image
      const image = await Jimp.read(tempPath);
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
      image.print(font, 10, image.bitmap.height - 50, captionText);

      const outPath = path.join(tmpdir(), `${uuidv4()}.png`);
      await image.writeAsync(outPath);

      const file = new AttachmentBuilder(outPath, { name: 'captioned.png' });
      await interaction.reply({ files: [file] });

      fs.unlinkSync(outPath);
    }

    fs.unlinkSync(tempPath);
  } catch (error) {
    console.error('❌ Caption error:', error);
    return interaction.reply({ content: '❌ Failed to add caption. Try a different file.', flags: 64 });
  }
}

export { commandData as data, execute };
