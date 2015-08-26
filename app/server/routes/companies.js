import Q from 'q';
import _ from 'lodash';
import {Router} from 'express';

import Controller from '../controllers/company';
import Company    from '../../collections/company';
import PortalUser from '../../collections/portalUser';

var api = Router();
var multipart = require('connect-multiparty')();
var controller = new Controller();

api.get('/companies', function(req, res) {
  return controller.getCompanies(req, res);
});

api.post('/companies', multipart, function(req, res) {
  return controller.saveProfile(req, res);
});

api.get('/companies/:carrierId/info', function(req, res) {
  return controller.getInfo(req, res);
});

api.get('/companies/:carrierId/service', function(req, res) {
  return controller.getApplications(req, res);
});

api.get('/companies/:carrierId/applications', function(req, res) {
  return controller.getApplications(req, res);
});

api.put('/companies/:carrierId/profile', multipart, function(req, res) {
  return controller.saveProfile(req, res);
});

api.put('/companies/:carrierId/service', multipart, function(req, res) {
  return controller.saveService(req, res);
});

api.put('/companies/:carrierId/widget', multipart, function(req, res) {
  return controller.saveWidget(req, res);
});

//TODO maybe create another file for this
api.get('/application/companies', function(req, res) {
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
});

export default api;
