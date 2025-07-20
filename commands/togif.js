import {
  SlashCommandBuilder,
  AttachmentBuilder
} from 'discord.js';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempDir = path.join(__dirname, '..', 'temp');

export const data = new SlashCommandBuilder()
  .setName('mp4togif')
  .setDescription('Convert a video to an optimized GIF (max 5s, 8MB)')
  .addAttachmentOption(option =>
    option
      .setName('video')
      .setDescription('Upload a video file (MP4, MOV, MPEG, WEBM)')
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option
      .setName('fps')
      .setDescription('Frames per second (default: 15)')
      .setMinValue(5)
      .setMaxValue(30)
  )
  .addIntegerOption(option =>
    option
      .setName('width')
      .setDescription('Output width in pixels (default: 360)')
      .setMinValue(120)
      .setMaxValue(720)
  );

export async function execute(interaction) {
  const video = interaction.options.getAttachment('video');
  const fps = interaction.options.getInteger('fps') || 15;
  const width = interaction.options.getInteger('width') || 360;

  const allowedTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/webm'
  ];

  if (!allowedTypes.includes(video.contentType)) {
    return interaction.reply({
      content: '❌ Unsupported file type. Upload MP4, MOV, MPEG, or WEBM.',
      ephemeral: true
    });
  }

  await interaction.deferReply();

  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

   const id = randomUUID().slice(0, 8); // short random ID
   const filename = `converted-${id}.gif`;

   const inputPath = path.join(tempDir, `input-${id}`);
   const palettePath = path.join(tempDir, `palette-${id}.png`);
   const outputPath = path.join(tempDir, filename);

  try {
    const res = await fetch(video.url);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(inputPath, buffer);

    const scaleFilter = `fps=${fps},scale=${width}:-1:flags=lanczos`;

    // 1. Generate optimized palette with diff-based stats
    const paletteCmd = `ffmpeg -y -t 5 -i "${inputPath}" -vf "${scaleFilter},palettegen=stats_mode=diff" "${palettePath}"`;
    await new Promise((resolve, reject) =>
      exec(paletteCmd, (err, stdout, stderr) => (err ? reject(stderr || err) : resolve(stdout)))
    );

    // 2. Generate gif using dithered palette
    const gifCmd = `ffmpeg -y -t 5 -i "${inputPath}" -i "${palettePath}" -filter_complex "${scaleFilter}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5" "${outputPath}"`;
    await new Promise((resolve, reject) =>
      exec(gifCmd, (err, stdout, stderr) => (err ? reject(stderr || err) : resolve(stdout)))
    );

    const stats = fs.statSync(outputPath);
    const fileSizeMB = stats.size / (1024 * 1024);

    if (fileSizeMB > 8) {
      await interaction.editReply({
        content: `⚠️ GIF too large (${fileSizeMB.toFixed(2)}MB). Try reducing width or FPS.`,
      });
    } else {
      const gif = new AttachmentBuilder(outputPath, { name: filename });
      await interaction.editReply({
        content: `✅ Optimized GIF (${fileSizeMB.toFixed(2)}MB):`,
        files: [gif]
      });
    }
  } catch (err) {
    console.error('❌ Conversion error:', err);
    await interaction.editReply({
      content: '❌ Failed to convert video to GIF.'
    });
  } finally {
    [inputPath, palettePath, outputPath].forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
  }
}
