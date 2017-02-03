'use strict';

// Kolorowanie wiadomości konsolowych
const redFont = '\x1b[31m%s\x1b[0m';
const greenFont = '\x1b[32m%s\x1b[0m';
const yellowFont = '\x1b[33m%s\x1b[0m';

// Inicjalizacja GULP
const gulp = require('gulp');

// Wtyczki GULP
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const fs = require('fs');
const tinypng = require('gulp-tinypng');
const clean = require('gulp-clean');

// Kompilacja SASS
gulp.task('sass', function () {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError).on('end', function () {
            console.log(greenFont, '\nKompilacja SASS do CSS zakończona\n');
        }))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('src/css'));
});


// Watcher plików .scss
gulp.task('watch', function () {
    gulp.watch('src/scss/**/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['sass', 'watch']);

// Kopiowanie plików CSS do folderu produkcyjnego
gulp.task('css-move', function () {
    return gulp.src('src/css/**/*')
        .pipe(gulp.dest('dist/css'));
});

// Kompresja obrazów za pomocą API tinypng.com
gulp.task('tinypng', function () {
    let apiKey = fs.readFileSync('dependencies/tinypng_api_key.txt', 'utf8');
    return gulp.src('src/img/**/*')
        .pipe(tinypng(apiKey))
        .pipe(gulp.dest('dist/img')).on('end', function () {
            return gulp.src('.gulp', {
                    read: false
                })
                .pipe(clean());
        });
});