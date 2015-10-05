/* eslint no-process-exit */
'use strict';

var _        = require('lodash');
var logger   = require('winston');
var mongoose = require('mongoose');

/**
 * Initialize database connection
 *
 * @param {string} mongoURI MongoDB connection URI
 * @param {Object} mongoOpts MongoDB connection options
 * @param {Function} [cb]
 */
function initialize(mongodbURI, mongodbOpts, cb) {
  if (!mongodbURI || !mongodbOpts) {
    throw new Error('Both uri & options are required');
  }

  //TODO may be exposing sensitive information (e.g., password)
  logger.info('Connecting to Mongo on %s with %j', mongodbURI, mongodbOpts, {});
  mongoose.connect(mongodbURI, mongodbOpts);

  ['open', 'connected', 'disconnected', 'close'].forEach(function(evt) {
    mongoose.connection.on(evt, function() {
      logger.info('mongoose connection', evt);
    });
  });

  mongoose.connection.on('error', function(err) {
    logger.error(err);
  });

  process.on('SIGINT', function() {
    mongoose.connection.close(function() {
      process.exit(0);
    });
  });

  if (_.isFunction(cb)) {
    cb();
  }
}

module.exports = initialize;
