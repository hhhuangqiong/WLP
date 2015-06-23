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
api.get('/switcher/companies', function(req, res) {
  req.checkQuery('userId').notEmpty();

  let userId = req.query.userId;

  Q.ninvoke(PortalUser, 'findOne', { _id: userId })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: '' });
      }

      return Q.ninvoke(Company, 'find', {}, 'name carrierId logo status');
    }).
    then((companies)=> {
      let _companies = [];

      for (let key in companies) {
        _companies[key] = _.merge(companies[key].toObject(), { role: companies[key].role, identity: companies[key].identity });

        if (key == companies.length - 1) {
          return res.json({
            companies: _companies
          })
        }
      }
    }).
    catch(function(err) {
      if (err)
        return res.status(err.status).json({
          error: err
        });
    });
});

export default api;
