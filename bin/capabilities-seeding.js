import mongoose from 'mongoose';
import path from 'path';
import logger from 'winston';
import { MongoDBError, NotFoundError } from 'common-errors';

import nconf from '../app/server/initializers/nconf';
import Company from '../app/collections/company';
import capabilityList from '../app/main/authority/data/capabilities';

const DEFAULT_ENV = 'development';
const CONFIG = nconf(process.env.NODE_ENV || DEFAULT_ENV, path.resolve(__dirname, '../app/config'));
const MONGODB_URI = CONFIG.get('mongodb:uri');
const MONGODB_OPTIONS = CONFIG.get('mongodb:options');

function onError(error) {
  logger.error(error.message, error.stack);
  process.exit(1);
}

function findCompanies() {
  return new Promise((resolve, reject) => {
    Company.find({}, (companyFindError, companies) => {
      if (companyFindError) return reject(companyFindError);
      resolve(companies);
    });
  });
}

function assignCapabilitiesToCompany(company) {
  return new Promise((resolve, reject) => {
    company.capabilities = capabilityList[company.carrierId] || [];

    company.save((companySaveError, doc) => {
      if (companySaveError) return reject(new MongoDBError('Cannot save company', companySaveError));
      logger.info(`Company ${doc.name} of carrierId ${doc.carrierId} has been updated with capabilities: \n${doc.capabilities}\n`);
      resolve(doc);
    });
  });
}

function startSeeding() {
  findCompanies()
    .then(companies => {
      /* Wait until all doc get saved and quit the process */
      Promise
        .all(companies.map(company => assignCapabilitiesToCompany(company)))
        .then(() => process.exit(0))
        .catch(error => onError(error));
    })
    .catch(error => onError(error));
}

if (!MONGODB_URI || !MONGODB_OPTIONS) onError(new NotFoundError('Missing parameters for mongoose connection'));

logger.log(`Connecting to ${MONGODB_URI} with options\n ${MONGODB_OPTIONS}`);
mongoose.connect(MONGODB_URI, MONGODB_OPTIONS);
mongoose.connection.on('connected', startSeeding);
