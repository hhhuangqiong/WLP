import { MongoClient } from 'mongodb';
import logger from 'winston';

import { importCompanies } from './migration/company';
import { importProvisions } from './migration/provision';
import { importUsers } from './migration/user';
import { lineBreak } from './utils';
import GridFs from './utils/GridFs';
import config from '../config.json';

export async function importTask() {
  try {
    const iamDb = await MongoClient.connect(config.import.iam.mongo.uri, config.import.iam.mongo.options);
    logger.info(`[Import]Connect to IAM database ${config.import.iam.mongo.uri}`);
    const mpsDb = await MongoClient.connect(config.import.mps.mongo.uri, config.import.mps.mongo.options);
    logger.info(`[Import]Connect to MPS database ${config.import.mps.mongo.uri}`);
    const iamgGridFs = new GridFs(iamDb);
    await importCompanies(iamDb, iamgGridFs);
    lineBreak();
    await importProvisions(mpsDb);
    lineBreak();
    await importUsers(iamDb);
    lineBreak();
    logger.info('[Import]Finish import task');
  } catch (ex) {
    logger.error('[Import]Fail to import data', ex);
  }
}
