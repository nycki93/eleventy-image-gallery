/** @param {import('@11ty/eleventy/UserConfig').default} eleventyConfig */
module.exports = function(eleventyConfig) {
    eleventyConfig.setInputDirectory('content');
    eleventyConfig.addPassthroughCopy({ 'static': '/' });

    // use template for all pages unless otherwise stated!
    eleventyConfig.addGlobalData('layout', 'base.njk');
};

// get all tags inside a named collection, not counting the name of the collection itself.
module.exports.getCollectionTags = (filterTag) => (_, fullData) => {
    const tags = new Set();
    for (const page of fullData.collections[filterTag]) {
        for (const tag of page.data.tags) {
            if (tag == filterTag) continue;
            tags.add(tag);
        }
    }
    return Array.from(tags).toSorted();
};
