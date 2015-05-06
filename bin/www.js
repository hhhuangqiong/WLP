// Register babel to have ES6 support on the server
require('babel/register');

const http   = require('http');
const port   = 3000;
const server = require('../app/server').initialize(port);
const debug  = require('debug')('wlp');

http.createServer(server).listen(port, function() {
  debug('Express server listening on port %s (env: %s)', port, process.env.NODE_ENV);
});

