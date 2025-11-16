/** @param {import('@11ty/eleventy/UserConfig').default} eleventyConfig */
module.exports = function(eleventyConfig) {
    eleventyConfig.setInputDirectory('content');
    eleventyConfig.addPassthroughCopy({ 'static': '/' });

    eleventyConfig.addCollection('$galleryTagList', (collectionsApi) => {
        const c = {};
        for (const post of collectionsApi.getFilteredByTag('$gallery')) {
            for (const tag of post.data.tags) {
                c[tag] = true;
            }
        }
        delete c['$gallery'];
        return Object.keys(c).toSorted();
    });
};
