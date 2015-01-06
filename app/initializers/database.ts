import nconf = require('nconf');
import mongoose = require('mongoose');
import log = require('winston');

function initialize(cb) {

  var mongodbURI = nconf.get('mongodb:uri');

  log.info("Connecting to Mongo on %s", mongodbURI);

  mongoose.connect(mongodbURI);

  ['open', 'connected', 'disconnected', 'close'].forEach(function (evt) {
    mongoose.connection.on(evt, function () {
      log.info('mongoose connection', evt);
    });
  });

  // calling data seed function, didn't terminate with error
  mongoose.connection.on('open', function () {
    if (cb !== undefined && typeof(cb) == 'function') {
      cb();
    }
  })

  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      process.exit(0);
    })
  })
}

export = initialize;
