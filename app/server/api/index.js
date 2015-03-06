var _ = require('lodash');
var Q = require('q');

export default class Api {

  constructor(endUsersRequest, transactionRequest, walletRequest, vsfTransactionRequest) {
    this.endUserRequest = endUsersRequest;
    this.transactionRequest = transactionRequest;
    this.walletRequest = walletRequest;
    this.vsfTransactionRequest = vsfTransactionRequest;
  }

  getTransactions(req, res, next) {
    req.checkBody('startDate').notEmpty().isDate();
    req.checkBody('endDate').notEmpty().isDate();

    if (req.validationErrors())
      return res.status(400).json({
        error: new Error("missing mandatory field(s).")
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

  getVSFTransactions(req, res, next) {
    req.checkParams('carrierId').notEmpty();

    if (req.validationErrors())
      return res.status(400).json({
        error: new Error("missing mandatory field(s).")
      });

    this.vsfTransactionRequest.getTransactions(req.body, (err, result)=>{
      if (err)
        return res.status(err.status).json({
          error: err
        });

      return res.json(result);
    });
  }

  listEndUsers(req, res, next) {
    req.checkParams('carrierId').notEmpty();

    if (req.validationErrors())
      return res.status(400).json({
        error: new Error("missing mandatory field(s).")
      });

    var carrierId = req.params.carrierId;

    this.endUserRequest.getUsers(carrierId, function(err, body) {
      if (err)
        return res.status(err.status).json({
          error: err
        });

      return res.json(body);
    });
  }

  getEndUserDetails(req, res, next) {
    req.checkParams('carrierId').notEmpty();
    req.checkParams('username').notEmpty();

    if (req.validationErrors())
      return res.status(400).json({
        error: new Error("missing mandatory field(s).")
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

  suspendEndUser(req, res, next) {
    req.checkParams('carrierId').notEmpty();
    req.checkParams('username').notEmpty();

    if (validationErrors())
      return res.status(400).json({
        error: new Error("missing mandatory field(s).")
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

  reactivateEndUser(req, res, next) {
    req.checkParams('carrierId').notEmpty();
    req.checkParams('username').notEmpty();

    if (validationErrors())
      return res.status(400).json({
        error: new Error("missing mandatory field(s).")
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

  terminateEndUser(req, res, next) {
    req.checkParams('carrierId').notEmpty();
    req.checkParams('username').notEmpty();

    if (validationErrors())
      return res.status(400).json({
        error: new Error("missing mandatory field(s).")
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

  whitelistUsers(req, res, next) {
    req.checkParams('carrierId').notEmpty();
    req.checkParams('username').notEmpty();

    if (validationErrors())
      return res.status(400).json({
        error: new Error("missing mandatory field(s).")
      });

    var carrierId = req.params.carrierId;
    var username = req.params.username;

    this.endUserRequest.whitelistUsers(carrierId, users, function(err, body) {
      if (err)
        return res.status(err.status).json({
          error: err
        });

      return res.json(body);
    });
  }
}
