import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
let sharp;

const settings = {
  dirIn: 'input-images',
  dirOut: 'static/gallery',
}

const gallerySizeLimit = 400 * 1024;
const thumbnailSizeLimit = 20 * 1024;
const quality = [100, 99, 97, 95, 90, 80, 75, 70, 60, 50, 40];

/**
 * usage: 
 *   npm run add-images
 *   npm run add-images -- noshrink
 */
export async function addNewImages(args) {
  let dirIn, dirOut, dirGallery;
  if (args?.directories) {
    dirIn = path.join(args.directories.input, '..', settings.dirIn);
    dirOut = path.join(args.directories.input, '..', settings.dirOut);
    dirGallery = path.join(args.directories.input, '..', 'content', 'gallery');
  } else {
    dirIn = settings.dirIn;
    dirOut = settings.dirOut;
    dirGallery = path.join('content', 'gallery');
  }

  const noshrink = process.argv.indexOf('noshrink') > -1;
  
  await makedir(dirIn);
  await makedir(dirOut);
  
  const files = ((await fs.readdir(dirIn))
    .filter(f => !f.startsWith('.'))
  );
  if (!files.length) {
    console.log(`no files found in ${dirIn}.`);
    return;
  }

  for (const base of files) {
    const fileIn = path.join(dirIn, base);
    const { name } = path.parse(fileIn);

    // shrink file if necessary
    const imageSrc = await shrink({
      dirIn, dirOut, base, noshrink,
      threshold: gallerySizeLimit,
    });    
    const thumbnailSrc = await shrink({
      dirIn, dirOut, base, noshrink,
      threshold: thumbnailSizeLimit,
      suffix: '-thumb',
    });
    if (!imageSrc || !thumbnailSrc) {
      console.log(`error: failed to resize ${base}`);
    }

    // make new gallery page if necessary
    const galleryPage = path.join(dirGallery, `${name}.md`);
    const created = (new Date).toISOString();
    try {
      await fs.access(galleryPage);
      console.log(`${galleryPage} already exists, skipping`);
    } catch(err) {
      if (err.code !== 'ENOENT') throw err;
      console.log(`creating ${galleryPage}`);
      fs.writeFile(galleryPage, unindent(`
        ---
        title: ${name}
        thumbnail: "/gallery/${thumbnailSrc}"
        summary: 
        created: "${created}"
        updated: "${created}"
        tags:
          - tagme
        ---
        {% galleryImage src="/gallery/${imageSrc}", alt="${name}" %}
        <!-- write your description here -->
      `));
    }
  }
}

async function shrink({
  dirIn, base, dirOut, threshold, noshrink=false, suffix='',
}) {
  const fileIn = path.join(dirIn, base);
  const { name } = path.parse(fileIn);
  const { size } = await fs.stat(fileIn);
  
  // TODO: find a way to build this on arm
  if (noshrink || size <= threshold || process.arch == "arm64") {
    const fileOut = path.join(dirOut, base);
    console.log(`${fileIn} -> ${fileOut} (no changes)`);
    fs.copyFile(fileIn, fileOut);
    return base;
  }

  sharp = sharp || (await import('sharp')).default;
  const nameOut = `${name}${suffix}.jpg`;
  const fileOut = path.join(dirOut, nameOut);
  for (let i = 0; i < quality.length; i++) {
    const newStats = await (sharp(fileIn)
      .jpeg({ mozjpeg: true, quality: quality[i] })
      .toFile(fileOut)
    );
    if (i == quality.length-1 || newStats.size <= threshold) {
      console.log(`${fileIn} -> ${fileOut} (quality: ${quality[i]})`);
      return nameOut;
    }
  }
  return '';
}

async function makedir(dir) {
  try {
    await fs.stat(dir);
  } catch(err) {
    if (err.code !== 'ENOENT') throw err;
    await fs.mkdir(dir, { recursive: true });
  }
}

function unindent(s) {
  const lines = s.split('\n').slice(1);
  const indent = lines[0].match(/^\s*/)[0];
  return (lines
    .map(l => l.startsWith(indent) ? l.slice(indent.length) : l)
    .join('\n')
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  addNewImages();
}
