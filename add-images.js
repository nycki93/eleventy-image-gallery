import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

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
async function main() {
  const demo = process.env.DEMO == '1';
  const dirIn = demo ? path.join('demo', settings.dirIn) : settings.dirIn;
  const dirOut = demo ? path.join('demo', settings.dirOut) : settings.dirOut;
  console.log(process.env.DEMO);

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
    const fileOut = await shrink({
      dirIn, dirOut, base, noshrink,
      threshold: gallerySizeLimit,
    });    
    const thumbnailOut = await shrink({
      dirIn, dirOut, base, noshrink,
      threshold: thumbnailSizeLimit,
      suffix: '-thumb',
    });
    if (!fileOut) {
      console.log(`error: failed to resize ${base}`);
    }

    // make new gallery page if necessary
    const galleryPage = (demo
      ? path.join('demo', 'content', 'gallery', `${name}.md`)
      : path.join('content', 'gallery', `${name}.md`)
    );
    const created = (new Date).toISOString();
    try {
      await fs.access(galleryPage);
      console.log(`${galleryPage} already exists, skipping`);
    } catch(err) {
      if (err.code !== 'ENOENT') throw err;
      console.log(`creating ${galleryPage}`);
      const imgsrc = fileOut.replace(/^(demo\/)?static/, '');
      const thumbsrc = thumbnailOut.replace(/^(demo\/)?static/, '');
      fs.writeFile(galleryPage, unindent(`
        ---
        title: ${name}
        description:
        thumbnail: ${thumbsrc}
        created: "${created}"
        updated: "${created}"
        tags:
          - tagme
        ---
        {% galleryImage src="${imgsrc}", alt="${name}" %}
      `));
    }
  }
}

async function shrink({
  dirIn, base, dirOut, threshold, noshrink=false, suffix='',
}) {
  const fileIn = path.join(dirIn, base);
  const { name, ext } = path.parse(fileIn);
  const { size } = await fs.stat(fileIn);
  
  if (noshrink || size <= threshold) {
    const fileOut = path.join(dirOut, base);
    console.log(`${fileIn} -> ${fileOut} (no changes)`);
    fs.copyFile(fileIn, fileOut);
    return fileOut;
  }

  const fileOut = path.join(dirOut, `${name}${suffix}.jpg`);
  for (let i = 0; i < quality.length; i++) {
    const newStats = await (sharp(fileIn)
      .jpeg({ mozjpeg: true, quality: quality[i] })
      .toFile(fileOut)
    );
    if (i == quality.length || newStats.size <= threshold) {
      console.log(`${fileIn} -> ${fileOut} (quality: ${quality[i]})`);
      return fileOut;
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

main();
