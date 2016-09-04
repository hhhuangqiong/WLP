import { MongoClient } from 'mongodb';
import logger from 'winston';
import fs from 'fs';

import { exportCompanies } from './migration/company';
import { exportUsers } from './migration/user';
import GridFs from './utils/GridFs';
import config from '../config.json';
import { lineBreak } from './utils';

const buildDir = config.export.buildDir;

function clean(dir) {
  // remove the dir
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file) => {
      fs.unlinkSync(`${dir}/${file}`);
    });
    return;
  }
  // create dir
  fs.mkdirSync(dir);
}

export async function exportTask() {
  try {
    logger.info(`[Export]Connect to database ${config.export.mongo.uri}`);
    const db = await MongoClient.connect(config.export.mongo.uri, config.export.mongo.options);
    clean(buildDir);
    const gridFs = new GridFs(db);
    lineBreak();
    await exportCompanies(db, gridFs);
    lineBreak();
    await exportUsers(db);
    lineBreak();
    logger.info('[Export]Finish export task');
  } catch (ex) {
    logger.error('[Export]Fail to export data', ex);
  }
}
