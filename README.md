image-resize-dir
===============

ImageMagick is required. Please install it first.

Mac user:
```
brew install imagemagick --with-webp
```

## Install
```
npm install image-resize-dir -g
```

## Usage
```
$ image-resize-dir -h

  Usage: index [options]

  image-resize-dir: resize images in the dir

  Options:

    -V, --version                 output the version number
    -d, --source_dir <string>     source image files dir
    -o, --output_dir <dir>        output directory
    -w, --width <number>          resize image to this width
    -H, --height <number>         resize image to this height
    -W, --ignore_width <number>   width under this value would be ignored
    -X, --ignore_height <number>  height under this value would be ignored
    -l, --locale <string>         locale by which file list read from dir sorted, default is en, see https://www.npmjs.com/package/readdir-sorted
    -h, --help                    output usage information
```