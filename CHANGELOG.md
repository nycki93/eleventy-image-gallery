## 1.1.0

- moved galleryBase, atom, taglist, and thumbnail templates to plugin folder.
- removed inline css and moved it to gallery/style.css

## 1.1.2

- fixed regression with image thumbnails for images with spaces in filenames

## 1.2.0

- moved demo files to separate folder
- fixed an error when generating thumbnails for large images
- moved most logic into plugin or demo, keep main dir clean
- added workarounds when building on arm64 (tidy and sharp not supported)
