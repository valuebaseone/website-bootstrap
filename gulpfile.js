// The require statement tells Node to look into the node_modules folder for a package
// Once the package is found, we assign its contents to the variable
// gulp.src tells the Gulp task what files to use for the task
// gulp.dest tells Gulp where to output the files once the task is completed.
var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    sass = require('gulp-sass'),
    handlebars = require('gulp-compile-handlebars'),
    rename = require('gulp-rename'),
    popper = require('popper.js'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    del = require('del'),
    panini = require('panini'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    runSequence = require('run-sequence'),
    cssnano = require('gulp-cssnano'),
    autoprefixer = require('gulp-autoprefixer');
    sitemap = require('gulp-sitemap');
    htmlmin = require('gulp-htmlmin');
    removeHtmlComments = require('gulp-remove-html-comments');


// ------------ Development Tasks -------------
// Compile Sass into CSS
gulp.task('sass', function () {
    return gulp.src(['src/assets/scss/*.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded',
            sourceComments: 'map',
            sourceMap: 'sass',
            outputStyle: 'nested'
        }).on('error', sass.logError))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(cssnano())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("dist/assets/css"))
        .pipe(browserSync.stream());
        console.log('Compiling scss');
});

// Using panini, template, page and partial files are combined to form html markup
gulp.task('compile-html', function () {
    return gulp.src('src/pages/**/*.html')
        .pipe(panini({
            root: 'src/pages/',
            layouts: 'src/layouts/',
            partials: 'src/partials/',
            helpers: 'src/helpers/',
            data: 'src/data/'
        }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(removeHtmlComments())
        .pipe(gulp.dest('dist'));
        console.log('Compiling partials with Panini');
});

// Reset Panini's cache of layouts and partials
gulp.task('resetPages', (done) => {
    panini.refresh();
    done();
    console.log('Clearing panini cache');
});

// Watches for changes while gulp is running
gulp.task('watch', ['sass'], function () {
    // Live reload with BrowserSync
    browserSync.init({
        server: {
            baseDir: "./dist",
            serveStaticOptions: {
                extensions: ['html']
            }
        }
    });

    gulp.watch(['src/assets/js/*.js'], ['scripts', browserSync.reload]);
    gulp.watch(['node_modules/bootstrap/scss/bootstrap.scss', 'src/assets/scss/**/*'], ['sass', browserSync.reload]);
    gulp.watch(['src/assets/img/**/*'], ['images']);
    gulp.watch(['src/**/*.html'], ['resetPages', 'compile-html', browserSync.reload]);
    console.log('Watching for changes');
});


// ------------ Copying and optimization Tasks -------------
// Copies image files to dist
gulp.task('images', function () {
    return gulp.src('src/assets/img/**/*.+(png|jpg|jpeg|gif|svg)')
        .pipe(cache(imagemin ())) // Caching images that ran through imagemin
        .pipe(gulp.dest('dist/assets/img/'));
        console.log('Optimizing images');
});

// Places font files in the dist folder
gulp.task('font', function () {
    return gulp.src([
            'src/assets/fonts/*.eot',
            'src/assets/fonts/*.woff',
            'src/assets/fonts/*.woff2',
            'src/assets/fonts/*.ttf',
            'src/assets/fonts/*.otf'
        ])
        .pipe(gulp.dest("dist/assets/fonts"))
        .pipe(browserSync.stream());
        console.log('Copying fonts into dist folder');
});

// Concatenating js files
gulp.task('scripts', function () {
    // jQuery first, then Popper.js, then Bootstrap JS, then other JS libraries, and last app.js
    return gulp.src([
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/popper.js/dist/umd/popper.min.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js',
            'src/assets/js/app.js',
        ])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dist/assets/js/'))
        .pipe(browserSync.stream());
        console.log('Concatenating JavaScript files into single file');
});

// Cleaning/deleting files no longer being used in dist folder
gulp.task('clean:dist', function () {
    console.log('Removing old files from dist');
    return del.sync('dist');
});

// Generate a sitemap from our generated html files.
gulp.task('generate-sitemap',function () {
  return gulp.src('dist/**/*.html')
    .pipe(sitemap({
      siteUrl: 'https://www.valuebaseone.com',
      mappings: [{
        pages: ['**/*'],
        getLoc(siteUrl, loc, entry) {
          // Remove the trailing slash if it exists
          loc.replace(/\/$/, '');
          // Remove the trailing ".html"
          return loc.replace(/\.html/, '');
        }
      }]
    }))
    .pipe(gulp.dest('dist/'));
});

// ------------ Build Sequence -------------
// Simply run 'gulp' in terminal to run local server and watch for changes
gulp.task('default', ['clean:dist', 'font', 'scripts', 'images', 'compile-html', 'resetPages', 'watch']);

// Creates production ready assets in dist folder
gulp.task('build', function () {
    console.log('Building production ready assets');
    runSequence('clean:dist', 'sass', ['scripts', 'images', 'font', 'compile-html'], 'generate-sitemap');
});
