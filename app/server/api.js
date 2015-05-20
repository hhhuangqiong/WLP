import _ from 'lodash';
import Q from 'q';
import express from 'express';
import logger from 'winston';
import nconf from 'nconf';
import moment from 'moment';
import passport from 'passport';

import db from './db';
import { fetchDep } from './initializers/ioc';

import Company from '../collections/company';
import PortalUser from '../collections/portalUser';

import CompanyCtrl  from './controllers/company';

var multipart = require('connect-multiparty')();
var companyCtrl  = new CompanyCtrl();

var endUserRequest = fetchDep(nconf.get('containerName'), 'EndUserRequest');
var walletRequest = fetchDep(nconf.get('containerName'), 'WalletRequest');

var api = express.Router();

function getAuthUser(user) {
  // TODO double check if this is necessary for the data model
  let affiliatedCompany = user.affiliatedCompany  || {};
  return {
    _id: user._id,
    carrierId: affiliatedCompany.carrierId,
    role: affiliatedCompany.role
  };
};

api.post('/sign-in', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    let signInError = function() {
      return res.status(401).json({
        error: {
          name: 'BadCredentials',
          message: 'Wrong username or password'
        }
      });
    };

    // TODO simplify this
    if (err || !user || !user.hasValidOneTimePassword(req.body.onetimepassword)) {
      return signInError();
    };

    req.logIn(user, function(err) {
      if (err) {
        logger.error('failed during `req.logIn`', err);
        return signInError();
      }

      let token = req.sessionID;
      let authUser = getAuthUser(user);

      db.createSession(token);
      return res.json({ token: token, user: authUser });
    });
  })(req, res, next);
});

function validateTokenMiddleware(req, res, next) {
  var token = req.header('Authorization');
  if (!(token && db.checkSession(token))) {
    return res.status(401).json({
      error: {
        name: 'InvalidToken',
        message: 'Must provide valid auth token in Authorization header'
      }
    });
  }
  next();
}

api.use(validateTokenMiddleware);

// Check if auth token is a valid session
api.get('/session', function(req, res) {
  return res.sendStatus(200);
});

api.post('/sign-out', function(req, res) {
  let token = req.header('Authorization');

  if (token) {
    req.logout();
    db.revokeSession(token);
    return res.sendStatus(200);
  } else {
    return res.status(500).json({
      error: 'signout failed'
    });
  }
});

api.get('/companies', function(req, res) {
  return companyCtrl.getCompanies(req, res);
});

api.post('/companies', multipart, function(req, res) {
  return companyCtrl.saveProfile(req, res);
});

api.get('/companies/:carrierId/applications', function(req, res) {
  return companyCtrl.getApplications(req, res);
});

api.put('/companies/:carrierId/profile', multipart, function(req, res) {
  return companyCtrl.saveProfile(req, res);
});

api.put('/companies/:carrierId/service', multipart, function(req, res) {
  return companyCtrl.saveService(req, res);
});

api.put('/companies/:carrierId/widget', multipart, function(req, res) {
  return companyCtrl.saveWidget(req, res);
});

api.get('/switcher/companies', function(req, res) {
  req.checkQuery('userId').notEmpty();

  let userId = req.query.userId;

  Q.ninvoke(PortalUser, 'findOne', { _id: userId })
    .then((user)=>{
      if (!user)
        return res.status(401).json({
          error: ''
        });

      if (user.isRoot) {
        return Q.ninvoke(Company, 'find', {}, 'name carrierId logo status');
      } else {
        return Q.ninvoke(Company, 'find', {}, 'name carrierId logo status');
      }
    })
    .then((companies)=>{

      let _companies = [];

      for (let key in companies) {
        _companies[key] = _.merge(companies[key].toObject(), { role: companies[key].role, identity: companies[key].identity });

        if (key == companies.length - 1) {
          return res.json({
            companies: _companies
          })
        }
      }
    })
    .catch(function(err) {
      if (err)
        return res.status(err.status).json({
          error: err
        });
    });
});

api.get('/carriers/:carrierId/users', function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();
  req.checkQuery('pageNumberIndex').notEmpty().isInt();

  let carrierId = req.params.carrierId;
  let queries = req.query;

  var DateFormatErrors = function() {
    let dateFormat = nconf.get('display:dateFormat');
    return !moment(queries.fromTime, dateFormat).isValid() || !moment(queries.toTime, dateFormat).isValid();
  };

  //if (req.validationErrors() || DateFormatErrors())
  //  return res.status(400).json({
  //    error: "missing/invalid mandatory field(s)."
  //  });

  endUserRequest.getUsers(carrierId, queries, (err, result) => {
    if (err)
      return res.status(err.status).json({
        error: err
      });

    return res.json(result);
  });
});

api.get('/carriers/:carrierId/users/:username', function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('username').notEmpty();

  var user = {};

  var prepareEndUserRequestParams = _.bind(function() {
    return {
      carrierId: this.carrierId.trim(),
      username:  this.username.trim()
    }
  }, req.params);

  var prepareWalletRequestParams = function(user) {
    return {
      carrierId: user.carrierId,
      number: user.userDetails.username,
      sessionUserName: user.userDetails.displayName
    }
  };

  var sendEndUserRequest = _.bind(function(params) {
    return Q.ninvoke(this, 'getUser', params.carrierId, params.username);
  }, endUserRequest);

  var sendWalletRequest = _.bind(function(params) {
    return Q.ninvoke(this, 'getWalletBalance', params);
  }, walletRequest);

  var appendUserData = _.bind(function(user) {
    if (user.error)
      throw new Error('cannot find user.');

    for (var key in user) {
      this[key] = user[key];
    }

    return this;
  }, user);

  var appendWalletData = _.bind(function(wallets) {
    if (wallets)
      this.wallets = wallets;

    return this;
  }, user);

  Q.fcall(prepareEndUserRequestParams)
    .then(sendEndUserRequest)
    .then(appendUserData)
    .then(prepareWalletRequestParams)
    .then(sendWalletRequest)
    .then(appendWalletData)
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      return res.status(err.status).json({
        error: err
      });
    });
});

api.all('*', function(req, res) {
  return res.status(400).json({
    error: {
      name: 'BadUrl',
      message: 'No endpoint for given URL'
    }
  });
});

module.exports = api;
