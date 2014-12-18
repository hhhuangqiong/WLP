
import nconf = require('nconf');
import mongoose = require('mongoose');

function initialize(cb) {

    var mongodbURI = nconf.get('mongodb:uri');

    mongoose.connect(mongodbURI);

    ['open', 'connected', 'disconnected', 'close'].forEach(function(evt) {
        mongoose.connection.on(evt, function() {
            console.log('mongoose connection', evt);
        });
    });

  // calling data seed function, didn't terminate with error
  mongoose.connection.on('open', function() {
    if (cb !== undefined && typeof(cb) == 'function') {
      cb();
    }
  })

  process.on('SIGINT', function() {
    mongoose.connection.close(function() {
      process.exit(0);
    })
  })
}

export = initialize;
