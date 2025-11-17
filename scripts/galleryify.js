import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const dirIn = 'scripts/in';
const dirOut = 'static/gallery';
const shrinkThreshold = 100 * 1024;
const quality = [100, 99, 97, 95, 90, 80, 75, 70, 60, 50, 40];

/**
 * usage: 
 *   npm run galleryify
 *   npm run gallerify -- noshrink
 */
async function main() {
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
    let fileOut = path.join(dirOut, base);
    const { name } = path.parse(fileIn);
    const { size } = await fs.stat(fileIn);

    // shrink file if necessary
    if (noshrink || size <= shrinkThreshold) {
      const fileOut = path.join(dirOut, base);
      console.log(`${fileIn} -> ${fileOut} (no changes)`);
      fs.copyFile(fileIn, fileOut);
    } else {
      fileOut = path.join(dirOut, `${name}.jpg`);
      for (let i = 0; i < quality.length; i++) {
        const newStats = await (sharp(fileIn)
          .jpeg({ mozjpeg: true, quality: quality[i] })
          .toFile(fileOut)
        );
        if (i == quality.length || newStats.size <= shrinkThreshold) {
          console.log(`${fileIn} -> ${fileOut} (quality: ${quality[i]})`);
          break;
        }
      }
    }

    // make new gallery page if necessary
    const galleryPage = path.join('content', 'gallery', `${name}.md`);
    try {
      await fs.access(galleryPage);
      console.log(`${galleryPage} already exists, skipping`);
    } catch(err) {
      if (err.code !== 'ENOENT') throw err;
      console.log(`creating ${galleryPage}`);
      fs.writeFile(galleryPage, unindent(`
        ---
          title: ${name}
          tags:
            - tagme
        ---
        <img src="${fileOut.replace(/^static/, '')}">
      `));
    }
  }
}

async function makedir(dir) {
  try {
    await fs.stat(dir);
  } catch(err) {
    if (err.code !== 'ENOENT') throw err;
    await fs.mkdir(dir);
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
