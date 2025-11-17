/** @param {import('@11ty/eleventy/UserConfig').default} eleventyConfig */
module.exports = function(eleventyConfig) {
    eleventyConfig.setInputDirectory('content');
    eleventyConfig.addPassthroughCopy({ 'static': '/' });

    eleventyConfig.addCollection('$galleryTags', (collectionsApi) => {
        const tags = new Set();
        for (const page of collectionsApi.getFilteredByTag('$gallery')) {
            for (const tag of page.data.tags) {
                if (tag == '$gallery') continue;
                tags.add(tag);
            }
        }
        return Array.from(tags).toSorted();
    });

    // use template for all pages unless otherwise stated!
    eleventyConfig.addGlobalData('layout', 'base.njk');
};
