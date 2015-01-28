/// <reference path='../../../typings/mongoose/mongoose.d.ts' />
/// <reference path='../../../typings/winston/winston.d.ts' />
import mongoose = require('mongoose');
import logger   = require('winston');

/**
 * Initialize database connection
 *
 * @param {String} mongoURI MongoDB connection URI
 * @param {Function} cb
 */
function initialize(mongodbURI, cb) {
  logger.info("Connecting to Mongo on %s", mongodbURI);
  mongoose.connect(mongodbURI);

  ['open', 'connected', 'disconnected', 'close'].forEach(function (evt) {
    mongoose.connection.on(evt, function () {
      logger.info('mongoose connection', evt);
    });
  });

  process.on('SIGINT', function () {
    mongoose.connection.close(function () {
      process.exit(0);
    })
  })
}

export = initialize;
