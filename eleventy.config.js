import relativeLinks from './plugins/relative-links.js';
import gallery from './plugins/galleryify/index.js';
import { tidy } from 'htmltidy2';

/** @param {import('@11ty/eleventy/UserConfig').default} eleventyConfig */
export default function(eleventyConfig) {
    eleventyConfig.setInputDirectory('content');
    eleventyConfig.setOutputDirectory('output');
    eleventyConfig.addPassthroughCopy({ 'static': '/' });
    eleventyConfig.setDataFileBaseName('_data');
	eleventyConfig.addPlugin(relativeLinks);
    eleventyConfig.addPlugin(gallery);

    // use template for all pages unless otherwise stated!
    eleventyConfig.addGlobalData('layout', 'base.njk');

    // set base url for absolute links
    eleventyConfig.addGlobalData('site.url', process.env.url || 'http://localhost:8080');
    
    // remove the first <h1> tag on a page
    eleventyConfig.addNunjucksFilter('stripHeader', function(content) {
        return this.env.filters.safe(content.replace(/[\s\S]*<\/h1>/, ''));
    });

    eleventyConfig.addFilter('xmlDate', function(s) {
        return (new Date(s || 0)).toISOString();
    });

    // convert to xhtml so we can safely inject into atom feed later
    eleventyConfig.addAsyncFilter('xhtml', async function(content) {
        const xhtml = await new Promise((res, rej) => tidy(
            content, 
            { 'output-xhtml': true, 'show-body-only': true }, 
            (err, data) => err ? rej(err) : res(data)
        ));
        return this.env.filters.safe(xhtml);
    });
};

export const config = {
    markdownTemplateEngine: 'njk',
};
