import Q from 'q';
import _ from 'lodash';

import Controller from '../controllers/company';
import Company    from '../../collections/company';
import PortalUser from '../../collections/portalUser';

let controller = new Controller();

// '/companies'
let list = function(req, res) {
  return controller.getCompanies(req, res);
};

// '/companies'
let createProfile = function(req, res) {
  return controller.saveProfile(req, res);
};

// '/companies/parent'
let getParents = function(req, res) {
  return controller.getParentCompanies(req, res);
};

// '/companies/:carrierId/suspension'
let deactivateCompany = function(req, res) {
  return controller.deactivateCompany(req, res);
};

// .put('/companies/:carrierId/suspension',
let reactivateCompany = function(req, res) {
  return controller.reactivateCompany(req, res);
};

// '/companies/:carrierId/info'
let getInfo = function(req, res) {
  return controller.getInfo(req, res);
};

// '/companies/:carrierId/service'
let getService = function(req, res) {
  return controller.getApplications(req, res);
};

// '/companies/:carrierId/applications'
let getApplications = function(req, res) {
  return controller.getApplications(req, res);
};

// '/companies/:carrierId/profile'
let updateProfile = function (req, res) {
  return controller.saveProfile(req, res);
};

// '/companies/:carrierId/service'
let saveService = function(req, res) {
  return controller.saveService(req, res);
};

// '/companies/:carrierId/widget'
let saveWidget = function(req, res) {
  return controller.saveWidget(req, res);
};

// '/application/companies'
let getApplicationCompanies = function(req, res) {
  let { user } = res.locals.user;

  if (!user) {
    return res.status(401).json({
      error: 'missing parameter'
    });
  }

  Q.ninvoke(PortalUser, 'findOne', { _id: user })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          error: 'invalid identity'
        });
      }

      return Q.ninvoke(Company, 'getManagingCompany', user.affiliatedCompany)
        .then((companies) => {
          return res.json({
            companies: _.reduce(companies, (result, company) => {
              // to turn a mongoose document to object,
              // and append the `virtual` field of `role` and `identity`
              result.push(_.merge(company.toObject(), { role: company.role, identity: company.identity }));
              return result;
            }, [])
          });
        });
    })
    .catch(function(err) {
      if (err)
        return res.status(err.status || 500).json({
          error: err
        });
    })
    .done();
};

export {
  getApplicationCompanies,
  getApplications,
  getInfo,
  getService,
  list,
  updateProfile,
  saveService,
  saveWidget,
  createProfile,
  getParents,
  deactivateCompany,
  reactivateCompany
};
