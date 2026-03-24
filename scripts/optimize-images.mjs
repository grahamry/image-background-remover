#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '..', 'public', 'assets', 'images');

async function getDirectorySize(dir) {
  let size = 0;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      size += await getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  }

  return size;
}

async function optimizeImages() {
  console.log('开始优化图片...\n');

  // 优化 PNG 图片
  const pngImages = await imagemin(['public/assets/images/*.png'], {
    destination: 'public/assets/images',
    plugins: [
      imageminPngquant({
        quality: [0.6, 0.8],
        speed: 4,
      }),
    ],
  });

  // 优化 SVG 图片
  const svgImages = await imagemin(['public/assets/images/*.svg'], {
    destination: 'public/assets/images',
    plugins: [
      imageminSvgo({
        plugins: [
          {
            name: 'preset-default',
          },
        ],
      }),
    ],
  });

  console.log(`✓ 优化了 ${pngImages.length} 个 PNG 图片`);
  console.log(`✓ 优化了 ${svgImages.length} 个 SVG 图片\n`);

  // 显示优化结果
  const beforeSize = await getDirectorySize(imagesDir);
  await imagemin(['public/assets/images/*.{png,jpg,jpeg}'], {
    destination: 'public/assets/images',
    plugins: [
      imageminPngquant({ quality: [0.6, 0.8], speed: 4 }),
    ],
  });

  const afterSize = await getDirectorySize(imagesDir);
  const saved = beforeSize - afterSize;
  const savedPercent = ((saved / beforeSize) * 100).toFixed(2);

  console.log(`优化前: ${(beforeSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`优化后: ${(afterSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`节省: ${savedPercent}% (${(saved / 1024 / 1024).toFixed(2)} MB)\n`);
}

optimizeImages().catch(console.error);
