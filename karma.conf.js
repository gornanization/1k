module.exports = function(config) {
    config.set({
        frameworks: ['mocha', 'karma-typescript'],
        files: [
            'src/**/*.ts',
            'test/**/*.ts'
        ],
        karmaTypescriptConfig: {
            coverageOptions: {
                instrumentation: true,
                exclude: [/\.(d|spec|test)\.ts$/i],
            },
            reports: {
                'lcovonly': {
                    'directory': 'coverage',
                    'subdirectory': '.',
                    'filename': 'lcov.info'
                },
                'html': 'coverage'
            },
            tsconfig: './tsconfig.json'
        },
        preprocessors: {
            '**/*.ts': 'karma-typescript'
        },
        singleRun: true,
        reporters: ['progress', 'karma-typescript'],
        browsers: ['Chrome']
    });
};
