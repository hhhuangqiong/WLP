require('babel-register');

const wdioConfig = require('./wdio.conf.babel');
exports.config = Object.assign({}, wdioConfig.default, {
  // Reporter option can only be specified in this file to take effect of storing reports
  reporters: ['dot', 'junit'],
  reporterOptions: {
    junit: {
      outputDir: './test/browser/reports',
    },
  },
});
