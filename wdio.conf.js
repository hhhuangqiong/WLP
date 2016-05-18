require('babel-core/register');

const wdioConfig = require('./wdio.conf.babel');

exports.config = wdioConfig.default;
