import nconf from 'nconf';

import { fetchDep } from '../utils/bottle';

const companyController = fetchDep(nconf.get('containerName'), 'CompanyController');

// '/companies'
const getCompanies = (req, res, next) => (
  companyController.getCompanies(req, res, next)
);

// '/companies'
const createCompany = (req, res, next) => (
  companyController.createCompany(req, res, next)
);

// '/companies/:carrierId/suspension'
const deactivateCompany = (req, res, next) => (
  companyController.deactivateCompany(req, res, next)
);

// .put('/companies/:carrierId/suspension',
const reactivateCompany = (req, res, next) => (
  companyController.reactivateCompany(req, res, next)
);

// '/companies/:carrierId/info'
const getCompany = (req, res, next) => (
  companyController.getCompany(req, res, next)
);

// @TODO no service in the company, where to check now?
// '/companies/:carrierId/service'
const getService = (req, res, next) => (
  companyController.getApplications(req, res, next)
);

// '/companies/:carrierId/applications'
const getApplications = (req, res, next) => (
  companyController.getApplications(req, res, next)
);

// '/companies/:carrierId/applicationIds'
const getApplicationIds = (req, res, next) => (
  companyController.getApplicationIds(req, res, next)
);

const getManagingCompanies = (req, res, next) => (
  companyController.getManagingCompanies(req, res, next)
);

// '/companies/:carrierId/profile'
const updateCompany = (req, res, next) => (
  companyController.updateCompany(req, res, next)
);

// @TODO no service in the company, where to check now?
// '/companies/:carrierId/service'
const updateService = (req, res, next) => (
  companyController.updateService(req, res, next)
);

const getCompanyRoles = (req, res, next) => (
  companyController.getCompanyRoles(req, res, next)
);

export {
  getApplications,
  getApplicationIds,
  getManagingCompanies,
  getCompanyRoles,
  getCompany,
  getService,
  getCompanies,
  updateCompany,
  updateService,
  createCompany,
  deactivateCompany,
  reactivateCompany,
};
