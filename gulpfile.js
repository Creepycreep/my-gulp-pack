const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const gulpPug = require('gulp-pug');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const pages = require('gulp-gh-pages');


function scripts() {
  return src([
    'src/js/**/*.js',
    '!src/js/main.min.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('src/js'))
    .pipe(browserSync.stream())
}

function styles() {
  return src([
    'src/scss/**/*.+(scss|sass)',
    '!src/scss/**/_*.+(scss|sass)'
  ])
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version'] }))
    .pipe(concat('style.min.css'))
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(dest('src/css'))
    .pipe(browserSync.stream())
}

function pug() {
  return src([
    'src/pug/**/*.pug',
    '!src/pug/**/_*.pug'
  ])
    .pipe(gulpPug({ pretty: true }))
    .pipe(dest('src/'))
    .pipe(browserSync.stream())
}

function images() {
  return src('src/images/src/*.*')
    .pipe(newer('src/images'))
    .pipe(imagemin())
    .pipe(dest('src/images'))
}

function sprite() {
  return src('src/images/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg',
          example: true
        }
      }
    }))
    .pipe(dest('src/images'))
}

function watching() {
  browserSync.init({
    server: {
      baseDir: 'src/'
    }
  });

  watch(['src/images/src'], images)
  watch(['src/pug/**/*.pug'], pug)
  watch(['src/scss/*.+(scss|sass)'], styles)
  watch(['src/js/**/*.js', '!src/js/main.min.js'], scripts)
  watch(['src/*.html']).on('change', browserSync.reload)
}

function cleanDist() {
  return src('dist')
    .pipe(clean())
}

function building() {
  return src([
    'src/**/*.html',
    '!src/images/stack/*.html',
    'src/images/*.*',
    '!src/images/*.svg',
    'src/images/sprite.svg',
    'src/fonts/*.*',
    'src/css/style.min.css',
    'src/js/main.min.js',
  ], { base: 'src' })
    .pipe(dest('dist'))
}

function deploy() {
  return src('./dist/**/*.*')
    .pipe(pages());
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.browserSync = browserSync;
exports.clean = cleanDist;
exports.pug = pug;
exports.images = images;
exports.sprite = sprite;
exports.deploy = deploy;

exports.build = series(cleanDist, building, deploy);
exports.default = parallel(images, pug, styles, scripts, watching);
