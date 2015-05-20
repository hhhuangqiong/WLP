// Register babel to have ES6 support on the server
// 'react-router' is required for we're using a forked branch (not a build)
require('babel/register')({ only: /(app|react-router)/ });

const http   = require('http');
const port   = 3000;
const server = require('../app/server').initialize(port);
const debug  = require('debug')('app');

http.createServer(server).listen(port, function() {
  debug('Express server listening on port %s (env: %s)', port, process.env.NODE_ENV);
});
