#!/usr/bin/env node

import * as LibFs from 'mz/fs';
import * as LibPath from 'path';

import * as program from 'commander';
import * as isImage from 'is-image';
import * as shell from 'shelljs';
import * as readdirSorted from 'readdir-sorted';

const pkg = require('../package.json');

program.version(pkg.version)
    .description('image-resize-dir: resize images in the dir')
    .option('-d, --source_dir <string>', 'source image files dir')
    .option('-o, --output_dir <dir>', 'output directory')
    .option('-w, --width <number>', 'resize image to this width', parseInt)
    .option('-h, --height <number>', 'resize image to this height', parseInt)
    .option('-iw, --ignore_width <number>', 'width under this value would be ignored', parseInt)
    .option('-ih, --ignore_height <number>', 'height under this value would be ignored', parseInt)
    .option('-l, --locale <string>', 'locale by which file list read from dir sorted, default is en, see https://www.npmjs.com/package/readdir-sorted')
    .parse(process.argv);

const ARGS_SOURCE_DIR = (program as any).source_dir === undefined ? undefined : (program as any).source_dir;
const ARGS_OUTPUT_DIR = (program as any).output_dir === undefined ? undefined : (program as any).output_dir;
const ARGS_WIDTH = (program as any).width === undefined ? undefined : (program as any).width;
const ARGS_HEIGHT = (program as any).height === undefined ? undefined : (program as any).height;
const ARGS_IGNORE_WIDTH = (program as any).ignore_width === undefined ? undefined : (program as any).ignore_width;
const ARGS_IGNORE_HEIGHT = (program as any).ignore_height === undefined ? undefined : (program as any).ignore_height;
const ARGS_LOCALE = (program as any).locale === undefined ? 'en' : (program as any).locale;

class ImageResizeDir {

    public async run() {
        console.log('Resize starting ...');

        await this._validate();
        await this._process();
    }

    private async _validate() {
        console.log('Resize validating ...');

        if (!shell.which('convert') || !shell.which('montage')) {
            console.log('Command "convert | montage" not found, you need to install "ImageMagick" first.\nOSX e.g: brew install imagemagick --with-webp');
            process.exit(1);
        }

        // validate ARGS_SOURCE_DIR
        if (!ARGS_SOURCE_DIR) {
            console.log('Source dir is required, please provide -d');
            process.exit(1);
        }
        if (!(await LibFs.exists(ARGS_SOURCE_DIR)) || !(await LibFs.stat(ARGS_SOURCE_DIR)).isDirectory()) {
            console.log(`${ARGS_SOURCE_DIR} is not directory!`);
            process.exit(1);
        }

        // validate ARGS_OUTPUT_DIR
        if (!ARGS_OUTPUT_DIR) {
            console.log('Output dir is required, please provide -o');
            process.exit(1);
        }
        if (!(await LibFs.exists(ARGS_OUTPUT_DIR)) || !(await LibFs.stat(ARGS_OUTPUT_DIR)).isDirectory()) {
            console.log(`${ARGS_OUTPUT_DIR} is not directory!`);
            process.exit(1);
        }

        // validate ARGS_WIDTH & ARGS_HEIGHT
        if (!ARGS_WIDTH && !ARGS_HEIGHT) {
            console.log(`One of width or height is required, please provide -w or -h`);
            process.exit(1);
        }
    }

    private async _process() {
        const dirFiles = await readdirSorted(ARGS_SOURCE_DIR, {
            locale: ARGS_LOCALE,
            numeric: true
        });
        let files = [];
    }

}