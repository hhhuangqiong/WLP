var _ = require('lodash');
var Q = require('q');

import WhitelistRequest from 'app/lib/requests/Whitelist'

export default class Api {

  constructor(callsRequest, endUsersRequest, transactionRequest, walletRequest, vsfTransactionRequest, imRequest) {
    this.callsRequest = callsRequest;
    this.endUserRequest = endUsersRequest;
    this.transactionRequest = transactionRequest;
    this.walletRequest = walletRequest;
    this.vsfTransactionRequest = vsfTransactionRequest;
    this.imRequest = imRequest;
  }

  getApplication(req, res) {
    req.checkParams('carrierId').notEmpty();

    // TODO: turn into applcation request class and make real request
    return res.status(200).json({
      "carrierId": "developer173968.maaii-api.com",
      "developerKey": "mdevac0645a7-a956-4e5d-833f-7983d7cc44dc",
      "developerSecret": "bacbd718-6f17-47ad-8a95-f8edd93ae030",
      "applicationIdentifier": "com.maaii-api.xxx",
      "applications": {
        ios: {
          "applicationKey": "mapp6a245b5c-6933-7951-7825-4e55646d487b",
          "applicationSecret": "64705066-4f5c-2777-7e6b-7b32792f2e25",
          "platform": "com.maaii.platform.ios"
        },
        android: {
          "applicationKey": "mapp6a245b5c-6933-7951-7825-4e55646d487c",
          "applicationSecret": "64705066-4f5c-2777-7e6b-7b32792f2e26",
          "platform": "com.maaii.platform.android"
        }
      }
    });
  }

  getCalls(req, res) {
    req.checkQuery('carrierId').notEmpty();
    req.checkQuery('from').notEmpty();
    req.checkQuery('to').notEmpty();

    if (req.validationErrors())
      return res.status(400).json({
        error: "missing/invalid mandatory field(s)."
      });

    this.callsRequest.getCalls(req.query, (err, result) => {
      if (err)
        return res.status(err.status).json({
          error: err
        });

      return res.json(result);
    });
  }

  getImStat(req, res) {
    req.checkQuery('carrierId').notEmpty();
    req.checkQuery('from').notEmpty();
    req.checkQuery('to').notEmpty();

    if (req.validationErrors())
      return res.status(400).json({
        error: "missing/invalid mandatory field(s)."
      });

    this.imRequest.getImStat(req.query, (err, result) => {
      if (err)
        return res.status(err.status).json({
          error: err
        });

      return res.json(result);
    });
  }

  getTransactions(req, res) {
    req.checkBody('startDate').notEmpty().isDate();
    req.checkBody('endDate').notEmpty().isDate();

    if (req.validationErrors())
      return res.status(400).json({
        error: "missing/invalid mandatory field(s)."
      });

    var startDate    = req.body.startDate;
    var endDate      = req.body.endDate;

    this.transactionRequest.getTransactions(req.body, (err, result)=>{
      if (err)
        return res.status(err.status).json({
          error: err
        });

      return res.json(result);
    });
  }

  getVSFTransactions(req, res) {
    req.checkParams('carrierId').notEmpty();

    if (req.validationErrors())
      return res.status(400).json({
        error: "missing/invalid mandatory field(s)."
      });

    var carrierId = req.params.carrierId;

    this.vsfTransactionRequest.getTransactions(carrierId, req.query, (err, result)=>{
      if (err)
        return res.status(err.status).json({
          error: err
        });

      return res.json(result);
    });
  }

  listEndUsers(req, res) {
    req.checkParams('carrierId').notEmpty();

    if (req.validationErrors())
      return res.status(400).json({
        error: "missing/invalid mandatory field(s)."
      });

    var params = req.params;

    this.endUserRequest.getUsers(params, (err, result) => {
      if (err)
        return res.status(err.status).json({
          error: err
        });

      return res.json(result);
    });
  }

  getEndUserDetails(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkParams('username').notEmpty();

    if (req.validationErrors())
      return res.status(400).json({
        error: "missing/invalid mandatory field(s)."
      });

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
      return Q.ninvoke(this, 'getUser', params);
    }, this.endUserRequest);

    var sendWalletRequest = _.bind(function(params) {
      return Q.ninvoke(this, 'getWalletBalance', params);
    }, this.walletRequest);

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
  }

  suspendEndUser(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkParams('username').notEmpty();

    if (validationErrors())
      return res.status(400).json({
        error: "missing/invalid mandatory field(s)."
      });

    var carrierId = req.params.carrierId;
    var username = req.params.username;

    this.endUserRequest.suspendUser(carrierId, username, function(err, body) {
      if (err)
        return res.status(err.status).json({
          error: err
        });

      return res.json(body);
    })
  }

  reactivateEndUser(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkParams('username').notEmpty();

    if (validationErrors())
      return res.status(400).json({
        error: "missing/invalid mandatory field(s)."
      });

    var carrierId = req.params.carrierId;
    var username = req.params.username;

    this.endUserRequest.reactivateUser(carrierId, username, function(err, body) {
      if (err)
        return res.status(err.status).json({
          error: err
        });

      return res.json(body);
    })
  }

  terminateEndUser(req, res) {
    req.checkParams('carrierId').notEmpty();
    req.checkParams('username').notEmpty();

    if (validationErrors())
      return res.status(400).json({
        error: "missing/invalid mandatory field(s)."
      });

    var carrierId = req.params.carrierId;
    var username = req.params.username;

    this.endUserRequest.terminateUser(carrierId, username, function(err, body) {
      if (err)
        return res.status(err.status).json({
          error: err
        });

      return res.json(body);
    })
  }

  whitelistUsers(req, res) {
    var wl = new WhitelistRequest({ baseUrl: nconf.get('mumsApi:baseUrl') });

    req.checkParams('carrierId').notEmpty();
    req.checkParams('username').notEmpty();

    if (validationErrors())
      return res.status(400).json({
        error: "missing/invalid mandatory field(s)."
      });

    var carrierId = req.params.carrierId;
    var username = req.params.username;

    wl(carrierId, users, function(err, applied, notApplied) {
      if (err) {
        return res.status(err.status).json({
          error: err
        });
      }

      // TODO any status code to imply partial success?
      return res.json({
        usernamesApplied: applied,
        usernamesNotApplied: notApplied
      });
    });
  }
}
