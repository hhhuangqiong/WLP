import { Router } from 'express';

var Grid      = require('gridfs-stream');
var _         = require('lodash');
var logger    = require('winston');
var mongoose  = require('mongoose');
var Q         = require('Q');

var db         = mongoose.connection.db;
var GridStore  = mongoose.mongo.GridStore;
var mongoDrive = mongoose.mongo;

var router = Router();

router.get('/:imageId', function(req, res, next) {
  function readImageProperties(imageId, cb) {
    var gfs = new Grid(db, mongoDrive);
    gfs.findOne({ _id: imageId}, function (err, file) {
      if (err) return cb(err);
      return cb(null, file);
    });
  }

  function readImage(file, cb) {
    var gfs = new GridStore(db, file._id, 'r');
    gfs.open((err, gs) => {
      if (err) return next(err);
      gfs.read((err, data) => {
        if (err) return cb(err);
        file.imageData = data;
        return cb(null, file);
      })
    });
  }

  function renderImage(data) {
    res.writeHead('200', {
      'Content-Type': data.contentType,
      'Content-Length': data.length
    });
    res.end(data.imageData, 'binary');
  }

  Q.nfcall(readImageProperties, req.params.imageId)
    .then(function(file) {
      return Q.nfcall(readImage, file);
    })
    .then(renderImage)
    .catch(function(err) {
      logger.error(err);
      return next(err);
    });
});

export default router;
