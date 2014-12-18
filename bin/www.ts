import http = require('http');
var app = require('../app/app')(3000);
var debug = require('debug')('m800-whitelabel-portal');
var env = process.env.NODE_ENV || 'development';
var port = app.get('port');

http.createServer(app).listen(port, function() {
   debug('Express server listening on port %s (env: %s)', port, env);
});
