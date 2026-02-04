import { tidy } from 'htmltidy2';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from "node:url";

const pluginDir = path.dirname(fileURLToPath(import.meta.url));
export const defaultStyle = path.join(pluginDir, 'default.css');

/**
 * by Nick 'Nycki' Lamicela, 2025
 * License: CC-BY-NC. You may use this for noncommercial purposes only, and 
 * you must credit the original author.
 * 
 * Creates a _tags collection. All other pages that use an underscore-prefixed 
 * tag, such as _gallery, will have their pages added to the list. So for 
 * instance you can paginate on `collections._tags._gallery` to make a list of
 * all tags that are used in any _gallery page.
 * 
 * By convention, tags with a leading underscore should be omitted from
 * visible tag lists. This is a convention I just made up now.
 */
export default function(eleventyConfig, { galleryPath='gallery', extensions='png,jpeg' }) {
  // eleventyConfig.on('eleventy.before', addNewImages({ galleryPath, extensions }));

  eleventyConfig.addCollection('_tags', (collectionsApi) => {
    const tags = {
      _gallery: new Set(),
    };
    for (const item of collectionsApi.getAll()) {
      const metaTags = [];
      const itemTags = [];
      for (const t of item.data.tags || []) {
        if (t.startsWith('_')) {
          metaTags.push(t);
        } else {
          itemTags.push(t);
        }
      }
      for (const k of metaTags) {
        tags[k] = tags[k] || new Set();
        for (const t of itemTags) {
          tags[k].add(t);
        }
      }
    }
    for (const k of Object.keys(tags)) {
      tags[k] = [...tags[k]].sort();
    }
    return tags;
  });

  eleventyConfig.addShortcode('taglist', function(tags) {
    const result = [];
    result.push('<div class="gallery-taglist">')
    for (const tag of tags) {
      if (tag.startsWith('_')) continue;
      result.push(`<span class="gallery-tag"><a href="/tagged/${ tag }/">${ tag }</a></span>`)
    }
    result.push('</div>');
    return result.join('\n');
  });

  eleventyConfig.addShortcode('galleryThumbnailList', function(posts) {
    const result = [];
    result.push('<div class="gallery-thumbnail-list">');
    for (const post of posts || []) {
      result.push(`
        <div class="gallery-thumbnail"><a href="${ post.url }">
          <img src="${ post.data.thumbnail }" alt="${ post.data.title || post.page.fileSlug }">
        </a></div>
      `);
    }
    result.push('</div>');
    return result.join('\n');
  });

  eleventyConfig.addShortcode('galleryImage', function({ 
    src='', 
    width='', 
    height='', 
    alt='', 
  }) {
    return `
      <div class="gallery-image-container">
        <img class="gallery-image" src="${ src }" width="${ width }" height="${ height }" alt="${ alt }">
      </div>
    `;
  });

  // filters for atom/rss feeds

  eleventyConfig.addFilter('xmlDate', function(s) {
    return (new Date(s || 0)).toISOString();
  });

  // convert to xhtml so we can safely inject into atom feed later
  eleventyConfig.addAsyncFilter('xhtml', async function(content) {
    // TODO: find a library for this that works on arm. Or just implement it in JS.
    if (process.arch === "arm64") return content;
    
    const xhtml = await new Promise((res, rej) => tidy(
      content, 
      { 'output-xhtml': true, 'show-body-only': true }, 
      (err, data) => err ? rej(err) : res(data)
    ));
    return this.env.filters.safe(xhtml);
  });
}

async function doesResolve(p) {
  try {
    await p;
    return true;
  } catch {
    return false;
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

const addNewImages = ({ galleryPath, extensions }) => async ({ directories }) => {
  const dir = path.join(directories.input, galleryPath);
  const exts = extensions.split(',');
  const thumbSuffix = '-thumb.jpg';
  for (const base of await fs.readdir(dir)) {
    if (base.startsWith('.')) continue;
    if (base.endsWith(thumbSuffix)) continue;
    const { name, ext } = path.parse(base);
    if (!exts.includes(ext.slice(1))) continue;
    const file = path.join(dir, base);
    const { size } = await fs.stat(file);
    const thumb = path.join(dir, `${name}${thumbSuffix}`);
    const thumbExists = await doesResolve(fs.stat(thumb));
    if (!thumbExists) {
      console.log(`creating ${thumb}`);
      fs.copyFile(file, thumb);
    }
    const md = path.join(dir, `${name}.md`);
    const mdExists = await doesResolve(fs.stat(md));
    if (!mdExists) {
      console.log(`creating ${md}`);
      fs.writeFile(md, unindent(`
        ---
        title: "${name}"
        images: ["/gallery/${base}"]
        description:
        thumbnail: "/gallery/${base}"
        tags:
          - tagme
        ---
        {% galleryImage src="/gallery/${base}", alt="${name}" %}
        {{ description }}
      `));
    }
  }
}
