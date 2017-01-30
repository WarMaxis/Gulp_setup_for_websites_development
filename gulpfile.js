'use strict';

// Inicjalizacja GULP
const gulp = require('gulp');

// Wtyczki GULP
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');

// Kompilacja SASS
gulp.task('sass', function () {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError).on('end', function () {
            console.log('\nKompilacja SASS do CSS zakończona\n');
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