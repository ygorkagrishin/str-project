'use strict';

// базовый модуль
const gulp = require('gulp');
// минисервер с возможностью синхронизации и лайврелоадом
const browserSync = require('browser-sync').create();

// переводит pug(jade) в html
const pug = require('gulp-pug');

// переводит stylus в css
const stylus = require('gulp-stylus');
// добавляет карты с исходным кодом для JS и CSS
const sourcemaps = require('gulp-sourcemaps');

// добавляет префиксы браузеров в CSS
const autoprefixer = require('gulp-autoprefixer');

// базовый модуль Babel для работы с ES6
const babel = require('gulp-babel');
// объединяет файлы в один
const concat = require('gulp-concat');
// минификация js
const uglify = require('gulp-uglify');

// уменьшаем вес картинок
const imagemin = require('gulp-imagemin');

// спрайт svg
const svgstore = require('gulp-svgstore');
// уменьшаем вес svg
const svgmin = require('gulp-svgmin');
// для манипуляции html
const cheerio = require('gulp-cheerio');

// проброс сообщения об ошибке через всю цепочку задач
const plumber = require('gulp-plumber');
// выводит удобное сообщение об ошибках 
const notify = require('gulp-notify');
// выполнение операций в зависимости от условий
const gulpif = require('gulp-if');
// выводит дополнительную информацию об операциях с файлами
const debug = require('gulp-debug');
// фильтр пропускающий файлы которые изменились с предыдущего раза
const newer = require('gulp-newer');
// кеш файл для оптимизации скорости
const cached = require('gulp-cached');
// запоминает прошедшие через него файлы и вставляет их обратно в поток
// работает в паре с gulp-cached который пропускает только изменившиеся файлы
const remember = require('gulp-remember');
// меняем имя
const rename = require('gulp-rename');
// чистим папку
const del = require('del');

// Пути к основным файлам
const paths = {
    pug: {
        src: 'assets/pug',
        dest: 'public/'
    },
    stylus: {
        src: 'assets/static/styles',
        dest: 'public/'
    },
    scripts: {
        src: 'assets/static/scripts',
        dest: 'public/'
    },
    fonts: {
        src: 'assets/static/fonts',
        dest: 'public/fonts/'
    },
    images: {
        src: 'assets/static/images',
        dest: 'public/images/'
    },
    icons: {
        src: 'assets/static/icons',
        dest: 'public/icons/'
    },
    baseDir: 'public'
}

// Пути к остальным файлам
const otherFiles = {
    addCssBefore: [
        'node_modules/normalize.css/normalize.css'
    ],
    addJsBefore: [
        'node_modules/jquery/dist/jquery.min.js'
    ] 
}

const cssCacheName = 'csscache';
const jsCacheName = 'jscache';

const options = Object.assign(paths, otherFiles);

// Определение: разработка это или финальная сборка
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

// Чистим папку
gulp.task('del', () => {
    return del(options.baseDir + '/*');
});

// Собираем разметку
gulp.task('html:build', () => {
    return gulp.src(options.pug.src + '/*.pug')
    .pipe(plumber({
        errorHandler: err => {
            notify.onError({
                title: 'html build error',
                message: err.message
            })(err)
        }
    }))
    .pipe(debug({title: 'html'}))
    .pipe(pug(gulpif(isDevelopment, {pretty: true })))
    .pipe(gulp.dest(options.pug.dest));
});

// Копируем файлы css
gulp.task('css:copy', () => {
    return gulp.src(options.addCssBefore)
        .pipe(gulp.dest(options.baseDir + '/'))
});

// Собираем стили
gulp.task('css:build', () => {
    return gulp.src(options.stylus.src + '/styles.styl')
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
        .pipe(gulpif(isDevelopment, sourcemaps.init()))
        .pipe(remember(cssCacheName))
        .pipe(stylus(gulpif(!isDevelopment, {compress: true, 'include css': true})))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(rename('styles.min.css'))
        .pipe(gulpif(isDevelopment, sourcemaps.write('.')))
        .pipe(gulp.dest(options.stylus.dest));
});

// Копируем файлы скриптов
gulp.task('js:copy', () => {
    return gulp.src(options.addJsBefore)
        .pipe(gulp.dest(options.baseDir + '/'));
});

// Собираем скрипты
gulp.task('js:build', () => {
    return gulp.src(options.scripts.src + '/*.js')
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
        .pipe(gulpif(isDevelopment, sourcemaps.init()))
        .pipe(remember(jsCacheName))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulpif(!isDevelopment, uglify()))
        .pipe(concat('common.min.js'))
        .pipe(gulpif(isDevelopment, sourcemaps.write('.')))
        .pipe(gulp.dest(options.scripts.dest));
});

// Копируем шрифты
gulp.task('fonts:copy', () => {
    return gulp.src(options.fonts.src + '/**/*.{ttf,woff,woff2,eot,svg}')
        .pipe(newer(options.fonts.dest))
        .pipe(gulp.dest(options.fonts.dest));
});

// Копируем картинки
gulp.task('img:copy', () => {
    return gulp.src(options.images.src + '/**/**/*.{png,jpg}')
        .pipe(newer(options.images.dest))
        .pipe(imagemin({
            optimizationLevel: 5
        }))
        .pipe(gulp.dest(options.images.dest));
});

// Собирааем svg
gulp.task('svg:sprite', () => {
    return gulp.src(options.icons.src + '/*.svg')
    .pipe(newer(options.icons.dest))
    .pipe(svgmin(function (file) {
        return {
            plugins: [{
                cleanupIDs: {
                minify: true
                }   
            }]
        }
    }))
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(cheerio({
        run: function($) {
            $('svg').attr('style',  'display:none');
        },
        parserOptions: {
            xmlMode: true
        }
    }))
    .pipe(rename('sprite-svg.svg'))
    .pipe(gulp.dest(options.icons.dest))
});

gulp.task('watch', () => {
    gulp.watch(options.pug.src + '/**/*.pug', gulp.series('html:build'))
    gulp.watch(options.stylus.src + '/**/*.styl', gulp.series('css:build'))
    gulp.watch(options.scripts.src + '/*.js', gulp.series('js:build'))
    gulp.watch(options.fonts.src + '/**/*.{ttf,woff,woff2,eot,svg}', gulp.series('fonts:copy'))
    gulp.watch(options.images.src + '/**/**/*.{png,jpg}', gulp.series('img:copy'))
    gulp.watch(options.icons.src + '/**/*.svg', gulp.series('svg:sprite'))
});

gulp.task('serve', () => {
    browserSync.init({
        server: options.baseDir + '/'
    });

    gulp.watch(options.baseDir + '/**/**/*.*').on('change', browserSync.reload);    
});

gulp.task('build', 
    gulp.series('fonts:copy', 'img:copy', 'svg:sprite', 'css:copy', 'js:copy', 'html:build', 'css:build', 'js:build'));

// Собираем проект
gulp.task('default', gulp.series('del', 'build', gulp.parallel('watch', 'serve')));