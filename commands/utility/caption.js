// /commands/utility/caption.js
import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Jimp = require('jimp');
const gifFrames = require('gif-frames');
const GIFEncoder = require('gifencoder');
const { createCanvas, loadImage } = require('canvas');
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const data = new SlashCommandBuilder()
  .setName('caption')
  .setDescription('Adds a meme-style caption to an image or animated GIF')
  .addAttachmentOption(option =>
    option.setName('file').setDescription('Image or animated GIF').setRequired(true))
  .addStringOption(option =>
    option.setName('text').setDescription('Caption text').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();

  const attachment = interaction.options.getAttachment('file');
  const captionText = interaction.options.getString('text').toUpperCase();
  const fileUrl = attachment.url;
  const fileExt = path.extname(fileUrl).split('?')[0].toLowerCase();
  const tempPath = path.join(tmpdir(), `${uuidv4()}${fileExt}`);

  try {
    const response = await fetch(fileUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(tempPath, buffer);

    if (fileExt === '.gif') {
      const frames = await gifFrames({ url: tempPath, frames: 'all', outputType: 'png', cumulative: true });
      const framePaths = [];
      const delays = [];
      const captionHeight = 60;

      for (const frame of frames) {
        const framePath = path.join(tmpdir(), `${uuidv4()}.png`);
        await new Promise((resolve, reject) => {
          const stream = fs.createWriteStream(framePath);
          frame.getImage().pipe(stream);
          stream.on('finish', resolve);
          stream.on('error', reject);
        });
        framePaths.push(framePath);
        const rawDelay = frame.frameInfo?.delay;
        delays.push((typeof rawDelay === 'number' && rawDelay > 0 ? rawDelay : 10) * 10); // in ms
      }

      const firstImage = await loadImage(framePaths[0]);
      const width = firstImage.width;
      const height = firstImage.height + captionHeight;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      const encoder = new GIFEncoder(width, height);
      const gifPath = path.join(tmpdir(), `${uuidv4()}.gif`);
      const gifStream = fs.createWriteStream(gifPath);
      encoder.createReadStream().pipe(gifStream);

      encoder.start();
      encoder.setRepeat(0);
      encoder.setQuality(10);

      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'black';

      for (let i = 0; i < framePaths.length; i++) {
        try {
          const img = await loadImage(framePaths[i]);

          // Clear and draw
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = 'black';
          ctx.fillText(captionText, canvas.width / 2, 40);

          ctx.drawImage(img, 0, captionHeight);

          encoder.setDelay(delays[i] || 100);
          encoder.addFrame(ctx);
        } catch (frameErr) {
          console.warn(`⚠️ Skipping frame ${i} due to error:`, frameErr.message);
        } finally {
          fs.unlinkSync(framePaths[i]);
        }
      }

      encoder.finish();
      await new Promise(resolve => gifStream.on('finish', resolve));

      const file = new AttachmentBuilder(gifPath, { name: 'captioned.gif' });
      await interaction.editReply({ files: [file] });
      fs.unlinkSync(gifPath);
    } else {
      const image = await Jimp.read(tempPath);
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
      const captionHeight = 60;
      const memeImage = new Jimp(image.bitmap.width, image.bitmap.height + captionHeight, 0xffffffff);

      memeImage.print(
        font,
        0,
        10,
        { text: captionText, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
        memeImage.bitmap.width,
        captionHeight
      );

      memeImage.composite(image, 0, captionHeight);
      const outPath = path.join(tmpdir(), `${uuidv4()}.png`);
      await memeImage.writeAsync(outPath);

      const file = new AttachmentBuilder(outPath, { name: 'captioned.png' });
      await interaction.editReply({ files: [file] });
      fs.unlinkSync(outPath);
    }

    fs.unlinkSync(tempPath);
  } catch (err) {
    console.error('❌ Caption error:', err);
    await interaction.editReply({ content: '❌ Failed to caption image or GIF.' });
  }
}
