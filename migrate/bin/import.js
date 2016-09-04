require('babel-polyfill');
var importTask = require('../src').importTask;
importTask().then(process.exit);
