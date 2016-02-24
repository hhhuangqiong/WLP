import fs from 'fs';
import mongoose from 'mongoose';
import Grid from 'gridfs-stream';
import mime from 'mime';

module.exports = {
  getGridFS(cb) {
    const db = mongoose.connection.db;
    const mongoDriver = mongoose.mongo;

    try {
      return new Grid(db, mongoDriver);
    } catch (err) {
      return cb(err);
    }
  },

  /**
   * addFile
   * add file into gridFS from path of source
   *
   * @param {String} filePath - Path of file to be uploaded
   * @param {Object} options
   * @param {String} options.fileName - Custom file name
   * @param {Boolean} options.unlinkFile - Set true if you want to remove the file source, happens mostly in uploading
   * file
   * @param {Function} cb
   * @returns {*} - Returns GridFS document
   */
  addFile(filePath, options, cb) {
    const gfs = this.getGridFS(cb);

    if (!filePath) {
      return cb(new Error('missing file path'));
    }

    const writeStream = gfs.createWriteStream({
      filename: options.fileName || filePath.split('/').pop(),

      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      content_type: mime.lookup(filePath),
    });

    fs.createReadStream(filePath).pipe(writeStream);

    writeStream.on('close', function (gfsFile) {
      if (options.unlinkFile) {
        fs.unlink(filePath, function (err) {
          if (err) return cb(err);
          return cb(null, gfsFile);
        });
      } else {
        return cb(null, gfsFile);
      }
    });
  },
};
