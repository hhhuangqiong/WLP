import _ from 'lodash';
import Q from 'q';
import express from 'express';
import nconf from 'nconf';
import moment from 'moment';

import { fetchDep } from '../utils/bottle';

var endUserRequest = fetchDep(nconf.get('containerName'), 'EndUserRequest');
var walletRequest  = fetchDep(nconf.get('containerName'), 'WalletRequest');
var callsRequest   = fetchDep(nconf.get('containerName'), 'CallsRequest');
var topUpRequest   = fetchDep(nconf.get('containerName'), 'TopUpRequest');

import smsRequest from '../../lib/requests/SMS';

import PortalUser from '../../collections/portalUser';
import Company from '../../collections/company';

var api = express.Router();

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
      carrier: user.carrierId,
      number: user.userDetails.username,
      sessionUserName: 'Whitelabel-Portal'
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

api.get('/calls/carriers/:carrierId', function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('fromTime').notEmpty();
  req.checkParams('toTime').notEmpty();
  req.checkParams('page').notEmpty();

  let params = {
    // TODO  carrierId to be changed in the future
    caller_carrier : (req.params.carrierId == 'm800') ? 'maaiitest.com' : req.params.carrierId,
    type : (req.params.type) ? req.params.type : '',
    from : (req.query.fromTime) ? req.query.fromTime : moment().endOf('day').format('X'),
    to : (req.query.toTime) ? req.query.toTime : moment('2015-01-01').format('X'),
    caller : (req.query.caller) ? req.query.caller : '',
    callee : (req.query.callee) ? req.query.callee : '',
    page : (req.query.page) ? req.query.page : 0,
    size : (req.query.size) ? req.query.size : 10,
  };

  callsRequest.getCalls(params, (err, result) => {
    if (err)
      return res.status(err.status).json({
        error: err
      });

    return res.json(result);
  });
});

api.get('/carriers/:carrierId/topup', function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('startDate').notEmpty();
  req.checkQuery('endDate').notEmpty();
  req.checkQuery('page').notEmpty().isInt();
  req.checkQuery('pageRec').notEmpty().isInt();

  let params = {
    carrier: req.params.carrierId,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    number: req.query.number,
    page: req.query.page,
    pageRec: req.query.pageRec
  };

  topUpRequest.getTopUp(params, (err, result) => {
    if (err)
      return res.status(err.status).json({
        error: err
      });

    return res.json(result);
  });
});

api.get('/carriers/:carrierId/widgets/:type(calls|im|overview|store|sms)', function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('type').notEmpty();
  req.checkQuery('userId').notEmpty();

  let carrierId = req.params.carrierId;
  let type = req.params.type;
  let userId = req.query.userId;

  Q.ninvoke(PortalUser, 'findOne', { _id: userId })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          error: {
            name: 'InvalidUser'
          }
        });
      }

      return Q.ninvoke(Company, 'findOne', {
        carrierId: carrierId
      }, { lean: true });
    })
    .then((company) => {
      return res.json({
        carrierId: carrierId,
        widgets: company.widgets && company.widgets[type]
      });
    })
    .catch(function(err) {
      if (err)
        return res.status(err.status).json({
          error: err
        });
    });
});

api.get('/carriers/:carrierId/sms', function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('page').notEmpty().isInt();
  req.checkQuery('pageRec').notEmpty().isInt();

  let carrierId = req.params.carrierId;

  let query = {
    from: req.query.startDate,
    to: req.query.endDate,
    source_address_inbound: req.query.number,
    page: req.query.page,
    size: req.query.pageRec
  };

  let request = new smsRequest({ baseUrl: nconf.get('dataProviderApi:baseUrl'), timeout: nconf.get('dataProviderApi:timeout') });

  request.get(carrierId, query, (err, result) => {
    if (err)
      return res.status(err.status).json({
        error: err
      });

    return res.json(result);
  });
});

module.exports = api;
