require('babel-polyfill');
var exportTask = require('../src').exportTask;
exportTask().then(process.exit);
