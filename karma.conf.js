module.exports = function(config) {
    config.set({
        frameworks: ["mocha", "karma-typescript"],
        files: [
            "src/**/*.ts", // *.tsx for React Jsx
            "test/**/*.ts" // *.tsx for React Jsx
        ],
        karmaTypescriptConfig: {
            coverageOptions: {
                instrumentation: true,
                exclude: [/\.(d|spec|test)\.ts$/i],
            },
            reports: {
                "html": "coverage",
                "text-summary": ""
            },
            transformPath: function(filepath) {
                return filepath.replace(/\.(ts|tsx)$/, ".js");
            },
            tsconfig: "./tsconfig.json"
        },
        preprocessors: {
            "**/*.ts": "karma-typescript" // *.tsx for React Jsx
        },
        singleRun: true,
        reporters: ["progress", "karma-typescript"],
        browsers: ["Chrome"]
    });
};
