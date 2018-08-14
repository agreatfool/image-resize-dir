#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const LibFs = require("mz/fs");
const LibPath = require("path");
const program = require("commander");
const isImage = require("is-image");
const shell = require("shelljs");
const readdirSorted = require("readdir-sorted");
const sizeOf = require("image-size");
const pkg = require('../package.json');
program.version(pkg.version)
    .description('image-resize-dir: resize images in the dir')
    .option('-d, --source_dir <string>', 'source image files dir')
    .option('-o, --output_dir <dir>', 'output directory')
    .option('-w, --width <number>', 'resize image to this width', parseInt)
    .option('-H, --height <number>', 'resize image to this height', parseInt)
    .option('-W, --ignore_width <number>', 'width under this value would be ignored', parseInt)
    .option('-X, --ignore_height <number>', 'height under this value would be ignored', parseInt)
    .option('-l, --locale <string>', 'locale by which file list read from dir sorted, default is en, see https://www.npmjs.com/package/readdir-sorted')
    .parse(process.argv);
const ARGS_SOURCE_DIR = program.source_dir === undefined ? undefined : program.source_dir;
const ARGS_OUTPUT_DIR = program.output_dir === undefined ? undefined : program.output_dir;
const ARGS_WIDTH = program.width === undefined ? undefined : program.width;
const ARGS_HEIGHT = program.height === undefined ? undefined : program.height;
const ARGS_IGNORE_WIDTH = program.ignore_width === undefined ? undefined : program.ignore_width;
const ARGS_IGNORE_HEIGHT = program.ignore_height === undefined ? undefined : program.ignore_height;
const ARGS_LOCALE = program.locale === undefined ? 'en' : program.locale;
class ImageResizeDir {
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Resize starting ...');
            yield this._validate();
            yield this._process();
        });
    }
    _validate() {
        return __awaiter(this, void 0, void 0, function* () {
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
            if (!(yield LibFs.exists(ARGS_SOURCE_DIR)) || !(yield LibFs.stat(ARGS_SOURCE_DIR)).isDirectory()) {
                console.log(`${ARGS_SOURCE_DIR} is not directory!`);
                process.exit(1);
            }
            // validate ARGS_OUTPUT_DIR
            if (!ARGS_OUTPUT_DIR) {
                console.log('Output dir is required, please provide -o');
                process.exit(1);
            }
            if (!(yield LibFs.exists(ARGS_OUTPUT_DIR)) || !(yield LibFs.stat(ARGS_OUTPUT_DIR)).isDirectory()) {
                console.log(`${ARGS_OUTPUT_DIR} is not directory!`);
                process.exit(1);
            }
            // validate ARGS_WIDTH & ARGS_HEIGHT
            if (!ARGS_WIDTH && !ARGS_HEIGHT) {
                console.log(`One of width or height is required, please provide -w or -h`);
                process.exit(1);
            }
        });
    }
    _process() {
        return __awaiter(this, void 0, void 0, function* () {
            const dirFiles = yield readdirSorted(ARGS_SOURCE_DIR, {
                locale: ARGS_LOCALE,
                numeric: true
            });
            let target = [];
            let ignored = [];
            for (const file of dirFiles) {
                const fullPath = LibPath.join(ARGS_SOURCE_DIR, file);
                if ((yield this._validateImageFile(fullPath)) && this._validateDimension(fullPath)) {
                    target.push(file); // to be resized
                }
                else {
                    ignored.push(file); // to be copied
                }
            }
            for (const file of target) {
                this._resizeImage(file);
            }
            for (const file of ignored) {
                let source = LibPath.join(ARGS_SOURCE_DIR, file);
                let dest = LibPath.join(ARGS_OUTPUT_DIR, file);
                console.log(`Copy from ${source}, to ${dest}`);
                yield LibFs.copyFile(source, dest);
            }
        });
    }
    _resizeImage(file) {
        let command = '';
        if (ARGS_WIDTH) {
            command = `convert -resize ${ARGS_WIDTH}x ${LibPath.join(ARGS_SOURCE_DIR, file)} ${LibPath.join(ARGS_OUTPUT_DIR, file)}`;
        }
        else if (ARGS_HEIGHT) {
            command = `convert -resize x${ARGS_HEIGHT} ${LibPath.join(ARGS_SOURCE_DIR, file)} ${LibPath.join(ARGS_OUTPUT_DIR, file)}`;
        }
        else if (ARGS_WIDTH && ARGS_HEIGHT) {
            command = `convert -resize ${ARGS_WIDTH}x${ARGS_HEIGHT} ${LibPath.join(ARGS_SOURCE_DIR, file)} ${LibPath.join(ARGS_OUTPUT_DIR, file)}`;
        }
        console.log(`Resize images with command: ${command}`);
        const code = shell.exec(command).code;
        if (code !== 0) {
            console.log(`Error in resizing images, code: ${code}`);
            process.exit(code);
        }
    }
    _validateImageFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield LibFs.stat(filePath)).isFile() && isImage(filePath);
        });
    }
    _validateDimension(filePath) {
        if (!ARGS_IGNORE_WIDTH && !ARGS_IGNORE_HEIGHT) {
            return true; // no need to validate
        }
        let dimensions = sizeOf(filePath);
        if (ARGS_IGNORE_WIDTH && dimensions.width < ARGS_IGNORE_WIDTH) {
            return false;
        }
        if (ARGS_IGNORE_HEIGHT && dimensions.height < ARGS_IGNORE_HEIGHT) {
            return false;
        }
        return true;
    }
}
new ImageResizeDir().run().then(_ => _).catch(_ => console.log(_));
process.on('uncaughtException', (error) => {
    console.error(`Process on uncaughtException error = ${error.stack}`);
});
process.on('unhandledRejection', (error) => {
    console.error(`Process on unhandledRejection error = ${error.stack}`);
});
//# sourceMappingURL=index.js.map