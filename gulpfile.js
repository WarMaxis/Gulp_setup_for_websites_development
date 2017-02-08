'use strict';

// Kolorowanie wiadomości konsolowych
const fontColors = {
    red: '\x1b[31m%s\x1b[0m',
    green: '\x1b[32m%s\x1b[0m',
    yellow: '\x1b[33m%s\x1b[0m'
};

// Nazwy docelowych, produkcyjnych plików CSS i JS
const outputFileNames = {
    cssFile: 'styles.min.css',
    jsFile: 'scripts.min.js'
};

// Folder produkcyjny
const prodDirectory = 'dist/**/*';

// Inicjalizacja GULP
const gulp = require('gulp');

// Wtyczki GULP
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const fs = require('fs');
const tinypng = require('gulp-tinypng');
const clean = require('gulp-clean');
const htmlmin = require('gulp-htmlmin');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const ftp = require('vinyl-ftp');

// Kompilacja SASS
gulp.task('sass', function () {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError).on('end', function () {
            console.log(fontColors.green, '\nKompilacja SASS do CSS zakończona\n');
        }))
        .pipe(rename(outputFileNames.cssFile))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('src/css'));
});

// Watcher plików .scss
gulp.task('watch', function () {
    gulp.watch('src/scss/**/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['sass', 'watch', 'javascript', 'watch-js']);

// Kopiowanie plików CSS do folderu produkcyjnego
gulp.task('css-move', function () {
    return gulp.src('src/css/**/*')
        .pipe(gulp.dest('dist/css').on('end', function () {
            console.log(fontColors.green, '\nPrzenoszenie plików CSS zakończone\n');
        }));
});

// Kopiowanie i minifikacja plików HTML
gulp.task('html-move', function () {
    return gulp.src('src/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dist').on('end', function () {
            console.log(fontColors.green, '\nMinifikacja i przenoszenie plików HTML zakończona\n');
        }));
});

// Kompresja obrazów za pomocą API tinypng.com
gulp.task('tinypng', function () {
    let apiKey = fs.readFileSync('dependencies/tinypng_api_key.txt', 'utf8');
    return gulp.src('src/img/**/*')
        .pipe(tinypng(apiKey))
        .pipe(gulp.dest('dist/img')).on('end', function () {
            console.log(fontColors.green, '\nKompresja obrazów zakończona\n');
            return gulp.src('.gulp', {
                    read: false
                })
                .pipe(clean());
        });
});

// Browserify + minifikacja plików .js
gulp.task('javascript', function () {
    let browserifyConfig = browserify({
        entries: './src/js/main.js',
        debug: true
    });

    return browserifyConfig.bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(uglify().on('end', function () {
            console.log(fontColors.green, '\nŁączenie i minifikacja plików JavaScript zakończona\n');
        }))
        .pipe(rename(outputFileNames.jsFile))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./src/js/'));
});

// Watcher plików .js
gulp.task('watch-js', function () {
    gulp.watch(['src/js/**/*.js', '!src/js/app.js'], ['javascript']);
});

// Kopiowanie plików .js do folderu produkcyjnego
gulp.task('js-move', function () {
    return gulp.src(['src/js/' + outputFileNames.jsFile,
                    'src/js/*.map'], {
            base: 'src/js/'
        })
        .pipe(gulp.dest('dist/js').on('end', function () {
            console.log(fontColors.green, '\nPrzenoszenie plików JavaScript zakończone\n');
        }));
});

// Production build task (bez kompresji obrazów)
gulp.task('build', ['html-move', 'css-move', 'js-move']);

// Dane logowania do serwera FTP
const ftpAccesses = JSON.parse(fs.readFileSync('dependencies/ftp_accesses.json'));
const hostData = ftpAccesses.host;
const userData = ftpAccesses.user;
const passwordData = ftpAccesses.password;
const hostDirectoryData = ftpAccesses.hostDirectory;

// Kopiowanie plików z folderu produkcyjnego na serwer FTP
gulp.task('ftp', function () {
    var connect = ftp.create({
        host: hostData,
        user: userData,
        password: passwordData,
        parallel: 10
    });

    return gulp.src(prodDirectory, {
            buffer: false
        })
        .pipe(connect.newer(hostDirectoryData))
        .pipe(connect.dest(hostDirectoryData).on('end', function () {
            console.log(fontColors.yellow, '\nKopiowanie plików na serwer FTP zakończone\n');
        }));
});