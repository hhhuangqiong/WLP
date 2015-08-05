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
var imRequest   = fetchDep(nconf.get('containerName'), 'ImRequest');
var vsfRequest   = fetchDep(nconf.get('containerName'), 'VSFTransactionRequest');

import SmsRequest from '../../lib/requests/SMS';

import PortalUser from '../../collections/portalUser';
import Company from '../../collections/company';

var api = express.Router();

function prepareWildcard(search) {
  if (!search)
    return '';

  if (search.indexOf('@') > -1)
    search = search.substring(0, search.indexOf('@'));

  // if `+` exists, cannot apply like searching
  if (search.charAt(0) === '+') {
    return search.substring(1, search.length);
    // should use after tdr API was fixed
    //return search.trim();
  }

  return '*' + search.trim() + '*';
}

api.get('/carriers/:carrierId/users', function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();
  req.checkQuery('pageNumberIndex').notEmpty().isInt();

  let carrierId = req.params.carrierId;

  let queries = {
    fromTime: req.query.startDate,
    toTime: req.query.endDate,
    pageNumberIndex: req.query.page
  };

  var DateFormatErrors = function() {
    let dateFormat = nconf.get('display:dateFormat');
    return !moment(queries.startDate, dateFormat).isValid() || !moment(queries.endDate, dateFormat).isValid();
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
    let username = user.userDetails.username;
    return {
      carrier: user.carrierId,
      number:username[0] === '+' ? username.substring(1, username.length) : username,
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

api.get('/carriers/:carrierId/users/:username/wallet', function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('username').notEmpty();

  var prepareWalletRequestParams = _.bind(function() {
    return {
      carrier: this.carrierId.trim(),
      number: this.username[0] === '+' ? this.username.substring(1, this.username.length) : this.username,
      sessionUserName: 'Whitelabel-Portal'
    }
  }, req.params);

  var sendWalletRequest = _.bind(function(params) {
    return Q.ninvoke(this, 'getWalletBalance', params);
  }, walletRequest);

  Q.fcall(prepareWalletRequestParams)
    .then(sendWalletRequest)
    .then((wallets) => {
      if (wallets.length == 0) {
        return res.status(404).json(new Error('404 not found'));
      }

      return res.json(wallets);
    })
    .catch((err) => {
      return res.status(err.status).json({
        err
      });
    })
});

api.post('/carriers/:carrierId/users/:username/suspension', function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('username').notEmpty();

  let carrierId = req.params.carrierId;
  let username = req.params.username;

  Q.ninvoke(endUserRequest, 'suspendUser', carrierId, username)
    .then((result)=> {
      return res.json(result);
    })
    .catch((err)=> {
      return res.status(err.status).json({
        error: err
      });
    });
});

api.delete('/carriers/:carrierId/users/:username/suspension', function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('username').notEmpty();

  let carrierId = req.params.carrierId;
  let username = req.params.username;

  Q.ninvoke(endUserRequest, 'reactivateUser', carrierId, username)
    .then((result)=> {
      return res.json(result);
    })
    .catch((err)=> {
      return res.status(err.status).json({
        error: err
      });
    });
});

api.delete('/carriers/:carrierId/users/:username', function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkParams('username').notEmpty();

  let carrierId = req.params.carrierId;
  let username = req.params.username;

  Q.ninvoke(endUserRequest, 'terminateUser', carrierId, username)
    .then((result)=> {
      return res.json(result);
    })
    .catch((err)=> {
      return res.status(err.status).json({
        error: err
      });
    });
});

api.get('/carriers/:carrierId/calls', function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('startDate').notEmpty();
  req.checkQuery('endDate').notEmpty();
  req.checkQuery('page').notEmpty();

  let params = {
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    caller_carrier: req.params.carrierId,
    callee_carrier: req.params.carrierId,
    from: req.query.startDate,
    to: req.query.endDate,
    caller: prepareWildcard(req.query.search),
    callee: prepareWildcard(req.query.search),
    page: req.query.page,
    size: req.query.size,
    type: req.query.type
  };

  if (req.query.searchType === 'caller') {
    delete params.callee_carrier;
    delete params.callee;
  }

  if (req.query.searchType === 'callee') {
    delete params.caller_carrier;
    delete params.caller;
  }

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
    pageRec: req.query.pageRec,

    // always use like search
    isLikeSearch: true
  };

  topUpRequest.getTopUp(params, (err, result) => {
    if (err)
      return res.status(err.status).json({
        error: err
      });

    return res.json(result);
  });
});

api.get('/carriers/:carrierId/widgets/:type(calls|im|overview|store|sms|vsf)', function(req, res) {
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
      }, '', { lean: true });
    })
    .then((company) => {
      if (!company) {
        return res.status(404).json({
          error: {
            name: 'Invalid Carrier'
          }
        })
      }

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

  let request = new SmsRequest({ baseUrl: nconf.get('dataProviderApi:baseUrl'), timeout: nconf.get('dataProviderApi:timeout') });

  request.get(carrierId, query, (err, result) => {
    if (err)
      return res.status(err.status).json({
        error: err
      });

    return res.json(result);
  });
});

api.get('/carriers/:carrierId/im', function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();
  req.checkQuery('page').notEmpty().isInt();

  req.query.carrier = req.params.carrierId;
  req.query.from = req.query.fromTime;
  req.query.to = req.query.toTime;
  req.query.message_type = req.query.type;
  req.query.sender = '';
  req.query.recipient = '';

  if (req.query.search && !req.query.searchType)
    req.query.searchType = 'sender';

  if (req.query.searchType === 'sender')
    req.query.sender = prepareWildcard(req.query.search);

  if (req.query.searchType === 'recipient')
    req.query.recipient = prepareWildcard(req.query.search);

  req.query.type = 'IncomingMessage';

  let params =  _.pick(req.query, ['carrier', 'message_type', 'from', 'to', 'sender', 'recipient', 'page', 'size']);

  imRequest.getImStat(params, (err, result) => {
    if (err)
      return res.status(err.status).json({
        error: err
      });

    return res.json(result);
  });
});

api.get('/carriers/:carrierId/vsf', function(req, res) {
  req.checkParams('carrierId').notEmpty();
  req.checkQuery('fromTime').notEmpty();
  req.checkQuery('toTime').notEmpty();
  req.checkQuery('pageSize').notEmpty();

  var err = req.validationErrors();
  if (err) return res.status(400).json(err);

  let params = {
    fromTime: req.query.fromTime,
    toTime: req.query.toTime,
    pageIndex: req.query.pageIndex,
    pageSize: req.query.pageSize,
    category: req.query.category,
    userNumber: req.query.userNumber
  };

  vsfRequest.getTransactions(req.params.carrierId, params, (dumb, records) => {
    return res.json(records);
  });
});

module.exports = api;
