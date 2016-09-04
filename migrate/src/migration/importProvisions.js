import logger from 'winston';
import fs from 'fs';

import { insertData } from '../utils';
import config from '../../config.json';

const buildDir = config.export.buildDir;
const provisionJSON = `${buildDir}/provision.json`;

function loadProvisions() {
  logger.info('[Import]loading the provisions');
  const provisions = JSON.parse(fs.readFileSync(provisionJSON, 'utf8'));
  return provisions;
}

async function insertProvision(db, provisions) {
  logger.info('[Import]inserting the provisions');
  // bulk insert all the provision data
  await insertData(db, 'provisionings', provisions);
}

export async function importProvisions(db) {
  logger.info('[Import]Start import the provisions');
  // load mps data
  const provisions = loadProvisions();
  await insertProvision(db, provisions);
  logger.info('[Import]Done import the provisions');
}
