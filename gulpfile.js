'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();

const pug = require('gulp-pug');

const stylus = require('gulp-stylus');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');

const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const gulpif = require('gulp-if');
const debug = require('gulp-debug');
const newer = require('gulp-newer');
const cached = require('gulp-cached');
const remember = require('gulp-remember');
const rename = require('gulp-rename');
const del = require('del');

const paths = {
    pug: {
        src: 'assets/pug/*.pug',
        dest: 'public/',
        watch: 'assets/pug/**/*.pug'
    },
    stylus: {
        src: 'assets/static/styles/styles.styl',
        dest: 'public/',
        watch: 'assets/static/styles/**/*.styl'
    },
    scripts: {
        src: 'assets/static/scripts/*.js',
        dest: 'public/',
        watch: 'assets/static/scripts/*.js'
    },
    fonts: {
        src: 'assets/static/fonts/**/*',
        dest: 'public/fonts/',
        watch: 'assets/static/fonts/**/*'
    },
    images: {
        src: 'assets/static/images/**/**/*',
        dest: 'public/images/',
        watch: 'assets/static/images/**/**/*'
    },
    dir: 'public/'
}

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV == 'dev';

const cssCacheName = 'csscash';
const jsCacheName = 'jscache';

gulp.task('del', () => {
    return del(paths.dir + '*');
});

gulp.task('html:build', () => {
    return gulp.src(paths.pug.src)
    .pipe(plumber({
        errorHandler: err => {
            notify.onError({
                title: 'html build error',
                message: err.message
            })(err)
        }
    }))
    .pipe(debug({title: 'html'}))
    .pipe(pug({
        pretty: gulpif(isDev, true)
    }))
    .pipe(gulp.dest(paths.pug.dest));
});

gulp.task('css:build', () => {
    return gulp.src(paths.stylus.src)
        .pipe(plumber({
            errorHandler: err => {
                notify.onError({
                    title: 'css build error',
                    message: err.message
                })(err)
            }
        }))
        .pipe(cached(cssCacheName))
        .pipe(debug({title: 'css'}))
        .pipe(gulpif(isDev, sourcemaps.init()))
        .pipe(remember(cssCacheName))
        .pipe(stylus({
            compress: true,
            'include css': true
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(rename('styles.min.css'))
        .pipe(gulpif(isDev, sourcemaps.write('.')))
        .pipe(gulp.dest(paths.stylus.dest));
});

gulp.task('js:build', () => {
    return gulp.src(paths.scripts.src)
        .pipe(plumber({
            errorHandler: err => {
                notify.onError({
                    title: 'js build error',
                    message: err.message
                })(err)
            }
        }))
        .pipe(cached(jsCacheName))
        .pipe(debug({title: 'js'}))
        .pipe(gulpif(isDev, sourcemaps.init()))
        .pipe(remember(jsCacheName))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulpif(isDev, uglify()))
        .pipe(concat('common.min.js'))
        .pipe(gulpif(isDev, sourcemaps.write('.')))
        .pipe(gulp.dest(paths.scripts.dest));
});

gulp.task('fonts:copy', () => {
    return gulp.src(paths.fonts.src)
        .pipe(newer(paths.fonts.dest))
        .pipe(gulp.dest(paths.fonts.dest));
});

gulp.task('img:copy', () => {
    return gulp.src(paths.images.src)
        .pipe(newer(paths.images.dest))
        pipe(gulp.dest(paths.images.dest));
});

gulp.task('watch', () => {
    gulp.watch(paths.pug.watch, gulp.series('html:build'))
    gulp.watch(paths.stylus.watch, gulp.series('css:build'))
    gulp.watch(paths.scripts.watch, gulp.series('js:build'))
    gulp.watch(paths.fonts.watch, gulp.series('fonts:copy'))
    gulp.watch(paths.images.watch, gulp.series('img:copy'))
});

gulp.task('serve', () => {
    browserSync.init({
        server: paths.dir
    });

    gulp.watch(paths.dir + '**/**/*.*').on('change', browserSync.reload);    
});

gulp.task('build', gulp.series('fonts:copy', 'img:copy', 'html:build', 'css:build', 'js:build'));

gulp.task('default', gulp.series('del', 'build', gulp.parallel('watch', 'serve')));