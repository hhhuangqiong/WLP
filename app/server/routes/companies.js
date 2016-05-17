import Q from 'q';
import _ from 'lodash';
import logger from 'winston';

import Controller from '../controllers/company';
import Company from '../../collections/company';
import PortalUser from '../../collections/portalUser';

import {
  MongoDBError,
  NotFoundError,
  ArgumentError,
  ArgumentNullError,
} from 'common-errors';

const controller = new Controller();

// '/companies'
const list = function (req, res) {
  return controller.getCompanies(req, res);
};

// '/companies'
const createProfile = function (req, res) {
  return controller.saveProfile(req, res);
};

// '/companies/parent'
const getParents = function (req, res) {
  return controller.getParentCompanies(req, res);
};

// '/companies/:carrierId/suspension'
const deactivateCompany = function (req, res) {
  return controller.deactivateCompany(req, res);
};

// .put('/companies/:carrierId/suspension',
const reactivateCompany = function (req, res) {
  return controller.reactivateCompany(req, res);
};

// '/companies/:carrierId/info'
const getInfo = function (req, res) {
  return controller.getInfo(req, res);
};

// '/companies/:carrierId/service'
const getService = function (req, res) {
  return controller.getApplications(req, res);
};

// '/companies/:carrierId/applications'
const getApplications = function (req, res) {
  return controller.getApplications(req, res);
};

// '/companies/:carrierId/applicationIds'
const getApplicationIds = function (req, res) {
  return controller.getApplicationIds(req, res);
};

// '/companies/:carrierId/profile'
const updateProfile = function (req, res) {
  return controller.saveProfile(req, res);
};

// '/companies/:carrierId/service'
const saveService = function (req, res) {
  return controller.saveService(req, res);
};

// '/application/companies'
const getApplicationCompanies = function (req, res) {
  const { user } = res.locals.user;

  if (!user) {
    return res.status(401).json({
      error: 'missing parameter',
    });
  }

  Q.ninvoke(PortalUser, 'findOne', { _id: user })
    .then(user => {
      if (!user) {
        return res.status(401).json({
          error: 'invalid identity',
        });
      }

      return Q.ninvoke(Company, 'getManagingCompany', user.affiliatedCompany)
        .then(companies => {
          return res.json({
            companies: _.reduce(companies, (result, company) => {
              // to turn a mongoose document to object,
              // and append the `virtual` field of `role` and `identity`
              result.push(_.merge(company.toObject(), { role: company.role, identity: company.identity }));
              return result;
            }, []),
          });
        });
    })
    .catch(err => {
      if (err) {
        return res.status(err.status || 500).json({
          error: err,
        });
      }
    })
    .done();
};

const getCompanyByCarrierId = carrierId => {
  return new Promise((resolve, reject) => {
    if (!carrierId) {
      return reject(new ArgumentNullError('carrierId'));
    }

    Company.getCompanyByCarrierId(carrierId, (err, company) => {
      if (err) {
        return reject(new MongoDBError('Database error when getting company by carrierId', err));
      }

      if (!company) {
        return reject(new NotFoundError('Cannot find company by carrierId'));
      }

      resolve(company);
    });
  });
};

const getManagingCompany = companyId => {
  return new Promise((resolve, reject) => {
    if (!companyId) {
      return reject(new ArgumentNullError('companyId'));
    }

    Company.getManagingCompany(companyId, (err, companies) => {
      if (err) {
        return reject(new MongoDBError('Database error when getting managing company', err));
      }

      resolve(companies);
    });
  });
};

const carrierCompaniesHandler = async (carrierId) => {
  return await getManagingCompany(carrierId);
};

/**
 * @method getAccessibleCompanies
 * to get accessible companies by to user session
 *
 * @param req {Object} Express req
 * @param res {Object} Express res
 * @param next {Function} Express next
 */
const getAccessibleCompanies = (req, res, next) => {
  const { user } = req;

  logger.debug('fetching accessible companies');

  if (!user) {
    logger.debug('user is not logged in');
    res.apiResponse(200, {
      success: true,
      status: 200,
      data: [],
    });
    return;
  }

  const carrierId = _.get(req, 'user.affiliatedCompany.carrierId');

  if (!carrierId) {
    res.apiError(500, {
      success: false,
      status: 500,
      errors: new ArgumentError('req.user.affiliatedCompany.carrierId'),
    });
    return;
  }

  logger.debug('fetching accessible companies for carrier: %s', carrierId);

  carrierCompaniesHandler(carrierId)
    .then(companies => {
      logger.debug('fetched accessible companies for carrier: %s', carrierId, companies);

      res.apiResponse(200, {
        success: true,
        data: _.reduce(companies, (result, company) => {
          const { _id, ...attributes } = company.toObject({ virtuals: true });

          const document = {
            type: 'company',
            id: _id,
            attributes,
          };

          result.push(document);
          return result;
        }, []),
      });
    })
    .catch(err => {
      logger.error('error occurred when fetching accessible companies for carrier: %s', carrierId, err);
      res.apiError(500, {
        success: false,
        status: 500,
        errors: err,
      });
    });
};

export {
  getAccessibleCompanies,
  getApplicationCompanies,
  getApplications,
  getApplicationIds,
  getInfo,
  getService,
  list,
  updateProfile,
  saveService,
  createProfile,
  getParents,
  deactivateCompany,
  reactivateCompany,
};
