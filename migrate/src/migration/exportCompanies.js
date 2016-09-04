import _ from 'lodash';
import logger from 'winston';

import { formatNewCompany } from '../models/company';
import { formatNewProvision } from '../models/provision';
import { exportData, exportToFile, setTransformCompany, setCompanyList } from '../utils';
import config from '../../config.json';

const buildDir = config.export.buildDir;
const companyJSON = `${buildDir}/company.json`;
const provisionJSON = `${buildDir}/provision.json`;

async function exportCompanyData(db, gridFs) {
  logger.info('[Export]Start fetching the companies');
  const rawCompanies = await exportData(db, 'Company');
  for (const company of rawCompanies) {
    if (company.logo) {
      // update the logo to the file path
      company.logo = await gridFs.download(company.logo, buildDir);
    }
  }
  logger.info(`[Export]Done fetching the companies with ${rawCompanies.length} records`);
  return rawCompanies;
}

function migrateCompanies(companies) {
  // pre process the data before migrate

  // In all the version, m800 should be the origin root, remove it.
  // (it is replaced by either maaii.org, maaiii.org as the root company)
  const m800 = _.remove(companies, comp =>
    comp.carrierId && comp.carrierId.toLowerCase() === 'm800');
  // fetch the root company which is root domain rather than subdomain
  const rootCompany = _.find(companies, comp => comp.carrierId.split('.').length === 2);
  // expect only 1 company is named with m800
  if (m800.length === 1) {
    setTransformCompany(m800[0], rootCompany);
  } else if (m800.length > 1) {
    logger.error('[Export]Unexpected multiple m800 companies');
  }
  const resultObjArray = _.map(companies, company => {
    const mComp = company;
    // update the parent companyId
    if (rootCompany && rootCompany._id) {
      if (!company.parentCompany && company._id !== rootCompany._id) {
        mComp.parentCompany = rootCompany._id;
        mComp.parentCarrierId = rootCompany.carrierId;
      }
    }

    const result = {
      newCompany: formatNewCompany(mComp),
      newProvision: formatNewProvision(mComp),
    };
    return result;
  });
  setCompanyList(_.map(resultObjArray, obj => obj.newCompany));
  return resultObjArray;
}

export async function exportCompanies(db, gridFs) {
  logger.info('[Export]Start export company');
  // export companies data
  const companies = await exportCompanyData(db, gridFs);
  // migrate companies data
  const updatedCompanies = migrateCompanies(companies);
  // save the data
  exportToFile(companyJSON, _.map(updatedCompanies, company => company.newCompany));
  exportToFile(provisionJSON, _.map(updatedCompanies, company => company.newProvision));
  logger.info('[Export]Done export company');
}
