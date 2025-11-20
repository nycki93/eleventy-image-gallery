# eleventy-image-gallery

## demo

<https://nycki93.github.io/eleventy-image-gallery>

## setup

Galleryify is powered by NodeJS. You can download it from <https://nodejs.org/>. Or, if you're command-line savvy, try this:

Windows: `winget install nodejs`

Debian/Ubuntu: `sudo apt install nodejs npm`

Next, download this code. There should be a link at the top like Code -> Download ZIP.

Extract this code to a folder, such as C:/Users/Luna/Code/eleventy-image-gallery.

Right-click inside that folder, select "open terminal here", and type `npm install`. This should download some stuff into a folder called 'node_modules'. You can go offline now if you want, that's all we need to install. If you ever want to uninstall, just delete 'node_modules'.

That's it, we're ready to roll.

## usage

If this is your first time, you can delete the '.md' files in 'content/gallery', and the images in 'static/gallery'. Those are for the demo.

Place your images in the folder labeled 'input-images'. Run the command `npm run build`. The site will be generated in the 'output' folder.

To preview your site, run the command `npm run serve`. The site will be served at the address <http://localhost:8080>.

Want to customize it? Make any changes you like to the files in the 'content' and 'static' folders. 'static' is for things that will be copied to the output with no changes, 'content' is for things that will change when built. 

I especially recommend customizing `static/style.css` if you want to change the look and feel of your site. You should also look at the `.md` files in `content/gallery`, that's where you can add tags and descriptions to your images. When you're done, run `build` again.

## TODO

- clean up hard-coded CSS to make stuff easier to style
- clean up folder structure to make it more obvious what you do and don't need to modify
- make a more obvious way to do gallery sub-folders
- add a default home page that isn't just the same as the gallery page
