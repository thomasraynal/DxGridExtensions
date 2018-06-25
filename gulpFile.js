var gulp = require('gulp'),
    connect = require('gulp-connect'),
    minifyCSS = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    templateCache = require('gulp-angular-templatecache'),
    babel = require('gulp-babel'),
    Karma = require('karma').Server,
    path = require('path'),
    headerComment = require('gulp-header-comment');

var targetDir = './dist';

gulp.task('templates', function() {
    return gulp.src('./src/html/*.html')
        .pipe(templateCache('dxGridExtensionTemplates.js', { module: 'dxGridExtensionTemplates' }))
        .pipe(gulp.dest('./src/js'));
});

gulp.task('css', function() {
    return gulp.src('./src/css/*.css')
        .pipe(concat('dx-grid-extensions.min.css'))
        .pipe(minifyCSS({ 'keepSpecialComments-*': 0 }))
        .pipe(headerComment({
            file: path.join(__dirname, 'version')
        }))
        .pipe(gulp.dest(targetDir))
        .pipe(gulp.dest('demo/css'));

});

gulp.task('js', function() {
    return gulp.src([
            './src/js/module.js',
            './src/js/*.js'
        ])
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('dx-grid-extensions.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(headerComment({
            file: path.join(__dirname, 'version')
        }))
        .pipe(gulp.dest(targetDir))
        .pipe(gulp.dest('demo/js'));
});

gulp.task('vendorjs', function() {
    return gulp.src([
            './node_modules/jquery/dist/jquery.min.js',
            './node_modules/jquery-ui-dist/jquery-ui.min.js',
            './node_modules/jstat/dist/jstat.min.js',
            './node_modules/formulajs/dist/formula.min.js',
            './node_modules/angular/angular.min.js',
            './node_modules/lodash/lodash.min.js',
            './node_modules/jquery-ui-dist/jquery-ui.min.css',
            './vendor/dx.all.js'
        ])
        .pipe(gulp.dest(targetDir + '/vendor'))
        .pipe(gulp.dest('demo/js'));
});


gulp.task('test', function(done) {
    new Karma({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('connect', function() {
    connect.server({
        root: './demo',
        livereload: true,
        port: 8282
    });
});

gulp.task('watch', function() {
    gulp.watch(['./src/html/*.html'], ['templates', 'js']);
    gulp.watch(['./src/js/*.js'], ['js']);
    gulp.watch(['./src/css/*.css'], ['css']);
});

gulp.task('default', ['css', 'templates', 'js', 'vendorjs', 'watch', 'connect']);
