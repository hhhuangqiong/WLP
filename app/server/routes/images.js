import Grid from 'gridfs-stream';
import logger from 'winston';
import mongoose from 'mongoose';
import Q from 'q';

const db = mongoose.connection.db;
const GridStore = mongoose.mongo.GridStore;
const mongoDrive = mongoose.mongo;

const getImage = function (req, res, next) {
  function readImageProperties(imageId, cb) {
    const gfs = new Grid(db, mongoDrive);

    gfs.findOne({
      _id: imageId,
    }, (err, file) => {
      if (err) {
        return cb(err);
      }

      return cb(null, file);
    });
  }

  function readImage(file, cb) {
    const gfs = new GridStore(db, file._id, 'r');

    gfs.open(err => {
      if (err) {
        return next(err);
      }

      gfs.read((err, data) => {
        if (err) {
          return cb(err);
        }

        file.imageData = data;
        return cb(null, file);
      });
    });
  }

  function renderImage(data) {
    res.writeHead('200', {
      'Content-Type': data.contentType,
      'Content-Length': data.length,
    });

    res.end(data.imageData, 'binary');
  }

  Q.nfcall(readImageProperties, req.params.imageId)
    .then(file => Q.nfcall(readImage, file))
    .then(renderImage)
    .catch(err => {
      logger.error(err);
      return next(err);
    });
};

export { getImage };
