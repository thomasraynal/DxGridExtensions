var gulp = require('gulp'),
    connect = require('gulp-connect'),
    minifyCSS = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    templateCache = require('gulp-angular-templatecache'),
    babel = require('gulp-babel'),
    Karma = require('karma').Server;


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
        // .pipe(ngAnnotate())
        // .pipe(uglify())
        .pipe(gulp.dest(targetDir))
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

gulp.task('default', ['css', 'templates', 'js', 'watch',  'connect']);
