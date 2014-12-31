import http = require('http');
///ts:import=app,App
var port:number=3000;
var app = App.initialize(port);
var debug = require('debug')('m800-whitelabel-portal');
var env = process.env.NODE_ENV || 'development';

http.createServer(app).listen(port, function() {
   debug('Express server listening on port %s (env: %s)', port, env);
});
