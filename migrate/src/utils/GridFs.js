import mongo from 'mongodb';
import Grid from 'gridfs-stream';
import { NotFoundError } from 'common-errors';
import mime from 'mime';
import fs from 'fs';

export default class GridFs {
  constructor(db) {
    this.gfs = Grid(db, mongo);
  }

  async download(id, folder) {
    let data = await this.gfs.files.find({ _id: id }).toArray();
    data = data[0];
    if (!data) {
      throw new NotFoundError(id);
    }
    const readstream = this.gfs.createReadStream({
      _id: id,
    });
    const writeStream = fs.createWriteStream(`${folder}/${id}_${data.filename}`);
    readstream.pipe(writeStream);

    return new Promise(resolve => {
      writeStream.on('close', () => {
        resolve(`${id}_${data.filename}`);
      });
    });
  }

  async upload(filePath) {
    const writeStream = this.gfs.createWriteStream({
      filename: filePath,
      content_type: mime.lookup(filePath),
    });
    fs.createReadStream(filePath).pipe(writeStream);
    return new Promise(resolve => {
      writeStream.on('close', resolve);
    });
  }
}
