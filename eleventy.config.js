import relativeLinks from './_config/relative-links.js';
import tagGroups from './_config/tag-groups.js';

/** @param {import('@11ty/eleventy/UserConfig').default} eleventyConfig */
export default function(eleventyConfig) {
    eleventyConfig.setInputDirectory('content');
    eleventyConfig.addPassthroughCopy({ 'static': '/' });
    eleventyConfig.setDataFileBaseName('_data');
	eleventyConfig.addPlugin(relativeLinks);
    eleventyConfig.addPlugin(tagGroups);

    // use template for all pages unless otherwise stated!
    eleventyConfig.addGlobalData('layout', 'base.njk');

    // set base url for absolute links
    eleventyConfig.addGlobalData('site.url', process.env.url || 'http://localhost:8080');
    
    // remove the first <h1> tag on a page
    eleventyConfig.addNunjucksFilter('stripHeader', function(content) {
        return this.env.filters.safe(content.replace(/<h1>.*<\/h1>/, ''));
    });
};

export const config = {
    markdownTemplateEngine: 'njk',
};
