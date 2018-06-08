// Karma configuration
// Generated on Sun May 06 2018 15:46:31 GMT+0200 (Romance Daylight Time)

module.exports = function(config) {
    config.set({


        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            './demo/js/data.js',
            './node_modules/jquery/dist/jquery.min.js',
            './node_modules/jquery-ui-dist/jquery-ui.min.js',
            './node_modules/angular/angular.min.js',
            './vendor/dx.all.js',
            './node_modules/jstat/dist/jstat.min.js',
            './node_modules/formulajs/dist/formula.min.js',
            './node_modules/lodash/lodash.min.js',
            './dist/dx-grid-extensions.min.js',
            './node_modules/angular-mocks/angular-mocks.js',
            './tests/tests.js'
        ],

        // list of files / patterns to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'dist/dx-grid-extensions.min.js': ['coverage'],
            'tests/tests.js': ['babel']
        },
        babelPreprocessor: {
            options: {
                presets: ['es2015'],
                sourceMap: 'inline',
            },
            filename: function(file) {
                return file.originalPath.replace(/\.js$/, '.es5.js');
            },
            sourceFileName: function(file) {
                return file.originalPath;
            }
        },

        plugins: [
            'karma-jasmine',
            'karma-phantomjs-launcher',
            'karma-coverage',
            'karma-babel-preprocessor'
        ],

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DEBUG,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        coverageReporter: {
            includeAllSources: false,
            dir: 'coverage/',
            reporters: [
                { type: "html", subdir: "html" },
                { type: 'text-summary' },
                { type: 'lcovonly', subdir: '.' },

            ]
        }
    })
}
