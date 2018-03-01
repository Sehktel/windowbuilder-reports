/**
 * gulpfile.js for windowbuilder.js
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 */

const gulp = require('gulp'),
	concat = require('gulp-concat'),
  strip = require('gulp-strip-comments'),
	rename = require('gulp-rename'),
  wrap = require("gulp-wrap");

module.exports = gulp;


// Cборка библиотеки рисовалки для report_server
gulp.task('windowbuilder-lib', function(){
  return gulp.src([
    './src/builder/import.js',
    './src/geometry/*.js',
    './src/modifiers/common/*.js',
    './src/builder/export.js',
  ])
    .pipe(concat('windowbuilder.js'))
    .pipe(gulp.dest('./server'))

});

// Cборка модификаторов для report_server
gulp.task('modifiers', function(){
  return gulp.src([
    './src/modifiers/enums/*.js',
    './src/modifiers/catalogs/*.js',
    './src/modifiers/documents/doc_calc_order.js',
  ])
    .pipe(concat('modifiers.js'))
    .pipe(wrap({ src: './server/metadata/modifiers.txt'}))
    .pipe(gulp.dest('./server/metadata'))

});

