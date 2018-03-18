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
const
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    fs = require('fs'),
    tinypng = require('gulp-tinypng'),
    clean = require('gulp-clean'),
    htmlmin = require('gulp-htmlmin'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    ftp = require('vinyl-ftp'),
    autoprefixer = require('gulp-autoprefixer');

// Kompilacja SASS
gulp.task('sass', function () {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError).on('end', function () {
            console.log(fontColors.green, '\n✔ Kompilacja SASS do CSS zakończona\n');
        }))
        .pipe(autoprefixer({
            browsers: ['last 10 versions'],
            cascade: false
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
            console.log(fontColors.green, '\n✔ Przenoszenie plików CSS zakończone\n');
        }));
});

// Kopiowanie i minifikacja plików HTML
gulp.task('html-move', function () {
    return gulp.src('src/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dist').on('end', function () {
            console.log(fontColors.green, '\n✔ Minifikacja i przenoszenie plików HTML zakończona\n');
        }));
});

// Kompresja obrazów za pomocą API tinypng.com
gulp.task('tinypng', function () {
    let apiKey = fs.readFileSync('dependencies/tinypng_api_key.txt', 'utf8');
    return gulp.src('src/img/**/*')
        .pipe(tinypng(apiKey))
        .pipe(gulp.dest('dist/img')).on('end', function () {
            console.log(fontColors.green, '\n✔ Kompresja obrazów zakończona\n');
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
            console.log(fontColors.green, '\n✔ Łączenie i minifikacja plików JavaScript zakończona\n');
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
            console.log(fontColors.green, '\n✔ Przenoszenie plików JavaScript zakończone\n');
        }));
});

// Production build task (bez kompresji obrazów)
gulp.task('build', ['html-move', 'css-move', 'js-move']);

// Dane logowania do serwera FTP
const
    ftpAccesses = JSON.parse(fs.readFileSync('dependencies/ftp_accesses.json')),
    hostData = ftpAccesses.host,
    userData = ftpAccesses.user,
    passwordData = ftpAccesses.password,
    hostDirectoryData = ftpAccesses.hostDirectory;

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
            console.log(fontColors.yellow, '\n✔ Kopiowanie plików na serwer FTP zakończone\n');
        }));
});