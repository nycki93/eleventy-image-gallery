import relativeLinks from './_config/relative-links.js';

/** @param {import('@11ty/eleventy/UserConfig').default} eleventyConfig */
export default function(eleventyConfig) {
    eleventyConfig.setInputDirectory('content');
    eleventyConfig.addPassthroughCopy({ 'static': '/' });
    eleventyConfig.setDataFileBaseName('_data');

	eleventyConfig.addPlugin(relativeLinks);

    eleventyConfig.addGlobalData('site.url', process.env.url || 'http://localhost:8080');

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
