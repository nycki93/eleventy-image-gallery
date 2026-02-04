import relativeLinks from './plugins/relative-links.js';
import gallery from './plugins/gallery/index.js';

/** @param {import('@11ty/eleventy/UserConfig').default} eleventyConfig */
export default function(eleventyConfig) {
    eleventyConfig.setInputDirectory('content');
    eleventyConfig.setOutputDirectory('output');
    eleventyConfig.addPassthroughCopy({ 'static': '/' });

    eleventyConfig.setDataFileBaseName('_data');
    eleventyConfig.setUseGitIgnore(false);
	eleventyConfig.addPlugin(relativeLinks);
    eleventyConfig.addPlugin(gallery);

    // use template for all pages unless otherwise stated!
    eleventyConfig.addGlobalData('layout', 'base.njk');

    // set base url for absolute links
    if (process.env.url) {
        eleventyConfig.addGlobalData('site.url', process.env.url);
    }
    
    // remove the first <h1> tag on a page
    eleventyConfig.addNunjucksFilter('stripHeader', function(content) {
        return this.env.filters.safe(content.replace(/[\s\S]*<\/h1>/, ''));
    });
};

export const config = {
    markdownTemplateEngine: 'njk',
};
