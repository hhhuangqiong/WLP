import nconf from 'nconf';

import { fetchDep } from '../utils/bottle';

const companyController = fetchDep(nconf.get('containerName'), 'CompanyController');

const getManagingCompaniesRoles = (req, res, next) => (
  companyController.getManagingCompaniesRoles(req, res, next)
);

const updateCompany = (req, res, next) => (
  companyController.updateCompany(req, res, next)
);

export {
  getManagingCompaniesRoles,
  updateCompany,
};
