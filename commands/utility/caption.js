// /commands/utility/caption.js
import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Jimp = require('jimp');
const gifFrames = require('gif-frames');
const GIFEncoder = require('gifencoder');
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

    const wrapCaption = async (text, font, maxWidth) => {
      const words = text.split(' ');
      let lines = [], currentLine = '';
      for (const word of words) {
        const testLine = currentLine + word + ' ';
        const width = Jimp.measureText(font, testLine);
        if (width > maxWidth - 20) {
          lines.push(currentLine.trim());
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine.trim());
      return lines;
    };

    const processImage = async (imagePath) => {
      const image = await Jimp.read(imagePath);
      const baseHeight = image.bitmap.height;
      const baseWidth = image.bitmap.width;

      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
      const lines = await wrapCaption(captionText, font, baseWidth);
      const lineHeight = 30; // Use 72 pt equivalent spacing
      const captionAreaHeight = lineHeight * lines.length + 20; // Slight padding

      const captionImage = new Jimp(baseWidth, captionAreaHeight, 0xffffffff);
      lines.forEach((line, i) => {
        captionImage.print(font, 0, i * lineHeight, {
          text: line,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
        }, baseWidth);
      });

      const combined = new Jimp(baseWidth, captionAreaHeight + baseHeight, 0xffffffff);
      combined.composite(captionImage, 0, 0);
      combined.composite(image, 0, captionAreaHeight);

      return combined;
    };

    if (fileExt === '.gif') {
      const frames = await gifFrames({ url: tempPath, frames: 'all', outputType: 'png', cumulative: true });
      const images = [], delays = [];

      for (const frameData of frames) {
        const framePath = path.join(tmpdir(), `${uuidv4()}.png`);
        await new Promise((resolve, reject) => {
          const stream = fs.createWriteStream(framePath);
          frameData.getImage().pipe(stream);
          stream.on('finish', resolve);
          stream.on('error', reject);
        });

        const finalImage = await processImage(framePath);
        const outPath = path.join(tmpdir(), `${uuidv4()}.png`);
        await finalImage.writeAsync(outPath);

        images.push(outPath);
        delays.push(frameData.frameInfo?.delay ? frameData.frameInfo.delay * 10 : 100);
        fs.unlinkSync(framePath);
      }

      const sample = await Jimp.read(images[0]);
      const encoder = new GIFEncoder(sample.bitmap.width, sample.bitmap.height);
      const gifPath = path.join(tmpdir(), `${uuidv4()}.gif`);
      const gifStream = fs.createWriteStream(gifPath);
      encoder.createReadStream().pipe(gifStream);

      encoder.start();
      encoder.setRepeat(0);
      encoder.setQuality(10);

      for (let i = 0; i < images.length; i++) {
        const frame = await Jimp.read(images[i]);
        encoder.setDelay(delays[i]);
        encoder.addFrame(frame.bitmap.data);
        fs.unlinkSync(images[i]);
      }

      encoder.finish();
      await new Promise(resolve => gifStream.on('finish', resolve));

      const file = new AttachmentBuilder(gifPath, { name: 'captioned.gif' });
      await interaction.editReply({ files: [file] });
      fs.unlinkSync(gifPath);
    } else {
      const finalImage = await processImage(tempPath);
      const outPath = path.join(tmpdir(), `${uuidv4()}.png`);
      await finalImage.writeAsync(outPath);

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
