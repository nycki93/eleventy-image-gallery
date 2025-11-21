import { tidy } from 'htmltidy2';
import { readFileSync } from "node:fs";
import path from 'node:path';
import { fileURLToPath } from "node:url";

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
export default function(eleventyConfig, { includesPath="_includes" }) {
  const dir = path.dirname(fileURLToPath(import.meta.url));

  eleventyConfig.addPassthroughCopy({ [path.join(dir, 'static')]: '/gallery' });

  eleventyConfig.addCollection('_tags', (collectionsApi) => {
    const tags = {};
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
      tags[k] = Array.from(tags[k]).toSorted();
    }
    return tags;
  });

  eleventyConfig.addTemplate(path.join(includesPath, 'atom.njk'), readFileSync(path.join(dir, 'atom.njk')));
  eleventyConfig.addTemplate(path.join(includesPath, 'galleryBase.njk'), readFileSync(path.join(dir, 'galleryBase.njk')));

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
    for (const post of posts) {
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
