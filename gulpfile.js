var gulp = require('gulp'),
    del = require('del'),
    size = require('gulp-size'),
    sass = require('gulp-sass'),
    nano = require('gulp-cssnano'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    imagemin = require('gulp-imagemin'),
    prefix = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    deploy = require('gulp-gh-pages'),
    uncss = require('gulp-uncss'),
    browserSync = require('browser-sync').create(),
    config = {
    publicDir: './public'
};

//Clean dist folder for each build
gulp.task('clean', function(done) {
    return del(['dist']);
});

//Watch + serve files
gulp.task('serve', ['scss'], function() {
    browserSync.init({
        server: {
            port: 80,
            baseDir: "./",
            proxy: 'localhost'
        }
    });

    gulp.watch('scss/**/*.scss', ['scss']);
    gulp.watch('js/*.js', ['js']);
    gulp.watch('images/*', ['images']);
    gulp.watch('index.html, valentines-day.html').on('change', browserSync.reload);
});

//paths to bower_components
var PATHS = {
    javascript: [
        'js/wow.js',
        'js/slick.js',
        'js/easing.js',
        'js/app.js',
        'js/hearts.js'
    ]
};

//deploy to gh-pages
gulp.task('deploy', ['jekyll-build'], function() {
    return gulp.src("./dist/**/*")
        .pipe(deploy());
});

//throw error if scss breaks
gulp.task('scss', function() {
    var onError = function(err) {
        notify.onError({
            title: "Gulp",
            subtitle: "Failure!",
            message: "Error: <%= error.message %>",
            sound: "Beep"
        })(err);
        this.emit('end');
    };
    //compile scss + slim off unused css + minify css
    return gulp.src('scss/app.scss')
        .pipe(sourcemaps.init())
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sass({
            includePaths: [config.bootstrapDir + '/assets/stylesheets'],
        }))
        .pipe(prefix({
            browsers: ['last 2 versions', '>5%', 'ie >= 9']
        }))
        .pipe(gulp.dest('css'))
        // .pipe(uncss({
        //         html: ['index.html']
        //     }))
        .pipe(nano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(size({ gzip: true, showFiles: true }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});

//compile js
gulp.task('js', function() {
    return gulp.src(PATHS.javascript)
        .pipe(concat('app.js'))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(size({ gzip: true, showFiles: true }))
        .pipe(gulp.dest('dist/js'));
});

//compress images
gulp.task('images', function() {
    return gulp.src('images/*')
        .pipe(imagemin({ progressive: true }))
        .pipe(gulp.dest('dist/images'));
});

//gulp commands
gulp.task('default', ['clean'], function() {
    gulp.start('scss', 'js', 'images', 'serve');
});
