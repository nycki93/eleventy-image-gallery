/** @param {import('@11ty/eleventy').UserConfig} eleventyConfig */
module.exports = function(eleventyConfig) {
    eleventyConfig.setInputDirectory('content');
    eleventyConfig.addPassthroughCopy({ 'static': '/' });
};
