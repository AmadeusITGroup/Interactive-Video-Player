
const webpackKarmaConfig = require('./config/webpack.karma');
const path = require('path');

delete webpackKarmaConfig.entry;

module.exports = function (config) {

  var _config = {
    browsers: ['Chrome_autoplay'],
    customLaunchers: {
      Chrome_autoplay: {
        base: 'Chrome',
        flags: ['--remote-debugging-port=9222', '--autoplay-policy=no-user-gesture-required']
      }
    },
    frameworks: ["jasmine"],
    reporters: ['mocha','kjhtml',"spec", 'coverage-istanbul', 'html'],
    files: [
      "node_modules/babel-polyfill/dist/polyfill.js",
      "dist/amadeus-video-player.css",
      "tests/index.ts"
    ],
    preprocessors: {
      "tests/index.ts": ["webpack"],
    },
    mime: {
      "text/x-typescript": ["ts", "tsx"],
    },
    singleRun: false,
    
    webpack: webpackKarmaConfig,

    webpackMiddleware: {
      //turn off webpack bash output when running the tests
      noInfo: true
    },

    coverageIstanbulReporter: {
      reports: [ 'html', 'text-summary', 'lcovonly'],
      dir: path.join(__dirname, 'coverage'),
      fixWebpackSourcePaths: true,
      skipFilesWithNoCoverage: true,
      'report-config': {
        html: { outdir: 'html' }
      }
    },

    // the default configuration
    htmlReporter: {
      outputDir: 'report',
      reportName: 'avs'
    }
  };

  config.set(_config);
};
