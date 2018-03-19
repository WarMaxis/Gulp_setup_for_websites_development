# Gulp setup for websites development

Simple Gulp setup for websites develoment.

Includes functions:
* compile SCSS;
* minification HTML, CSS, JS;
* create source maps;
* compress images with [TinyPNG](https://tinypng.com/) API;
* copy dist files to FTP server.

Enjoy!

Created by __[Michał Milanowski](https://www.linkedin.com/in/michalmilanowski/)__.

## All functions and Gulp tasks:
* ```gulp sass``` - compile your SCSS files into CSS with source maps, compressed and with autoprefixer
* ```gulp watch``` - watcher for ```gulp sass```
* ```gulp css-move``` - copy final CSS files from ```src``` directory to ```dist``` directory
* ```gulp html-move``` - copy HTML files from ```src``` directory to ```dist``` directory and minify it
* ```gulp tinypng``` - copy images from ```src``` directory to ```dist``` directory and compress it with [TinyPNG](https://tinypng.com/) API __(require your API key)__
* ```gulp javascript``` - concat, minify JavaScript files with __[Browserify](http://browserify.org/)__ so you can create JS modules and bundle up it
* ```gulp watch-js``` - watcher for ```gulp javascript```
* ```gulp js-move``` - copy final JS files from ```src``` directory to ```dist``` directory
* ```gulp build``` - copy final all files from ```src``` directory to ```dist``` directory
* ```gulp ftp``` - copy final all files from ```dist``` directory to __FTP server__ __(require your FTP passes)__
* ```gulp default``` - run ```gulp sass```, ```gulp watch```, ```gulp javascript```, ```gulp watch-js```

## How to start?
1. First, create new JS entry file ```main.js```, in main ```/src/js/``` directory.

2. _Optionally you can create ```tinypng_api_key.txt``` text file in ```/dependencies/``` directory with your __[TinyPNG](https://tinypng.com/) API key__._

3. _Optionally you can create ```ftp_accesses.json``` JSON file in ```/dependencies/``` directory with your __FTP passes__._  
_JSON structure:_  
```json
{
    "host": "yourhost.net",
    "user": "example",
    "password": "verystrongpassword123",
    "hostDirectory": "yourdirectory/anotherdirectory/"
}
```

4. Install dependencies (you can use [yarn](https://yarnpkg.com/lang/en/) also)
```bash
$ npm install
```

5. Run Gulp default tasks or one task
```bash
$ gulp
```
