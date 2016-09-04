import logger from 'winston';
import fs from 'fs';
import _ from 'lodash';
import { ObjectId } from 'mongodb';

import { insertData } from '../utils';
import { formatNewRole } from '../models/role';
import config from '../../config.json';

const buildDir = config.export.buildDir;
const companyJSON = `${buildDir}/company.json`;

function loadCompanies() {
  logger.info('[Import]loading the companies');
  const companies = JSON.parse(fs.readFileSync(companyJSON, 'utf8'));
  return companies;
}

async function insertCompanies(companies, db, gridFs) {
  logger.info('[Import]inserting the companies');
  // upload logo first and update the logo object id
  for (const company of companies) {
    // convert string to object id
    company._id = new ObjectId(company._id);
    // convert the format
    if (company.parent) {
      company.parent = new ObjectId(company.parent);
    }
    if (company.createdAt) {
      company.createdAt = new Date(company.createdAt);
    }
    if (company.updatedAt) {
      company.updatedAt = new Date(company.updatedAt);
    }
    if (company.logo) {
      const filePath = `${buildDir}/${company.logo}`;
      delete company.logo;
      if (fs.existsSync(filePath)) {
        const meta = await gridFs.upload(filePath);
        company.logo = meta._id;
      } else {
        logger.error(`[Import] Fail to find the ${company.name} logo file at ${filePath}`);
      }
    }
  }
  // bulk insert all the company data
  await insertData(db, 'Company', companies);
}

async function insertDefaultAdminRole(companies, db) {
  const roles = _.map(companies, formatNewRole);
  await insertData(db, 'Role', roles);
}
// it will import both iam companies and mps provision
export async function importCompanies(db, gridFs) {
  logger.info('[Import]Start import companies');
  // load companies data
  const companies = loadCompanies();
  // insert data to db
  await insertCompanies(companies, db, gridFs);
  // import roles after create company
  await insertDefaultAdminRole(companies, db);
  logger.info('[Import]Done import companies');
}
