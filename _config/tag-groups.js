/**
 * by Nick 'Nycki' Lamicela, 2025
 * License: CC-BY-NC. You may use this for noncommercial purposes only, and 
 * you must credit the original author.
 * 
 * Create a _tags collection. All other pages that use an underscore-prefixed 
 * tag, such as _gallery, will have their pages added to the list. So for 
 * instance you can paginate on `collections._tags._gallery` to make a list of
 * all tags that are used in any _gallery page.
 * 
 * By convention, tags with a leading underscore should be omitted from
 * visible tag lists. This is a convention I just made up now.
 */
export default function(eleventyConfig) {
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
}
