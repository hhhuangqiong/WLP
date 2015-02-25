var _ = require('lodash');
var Q = require('q');

export default class Api {

  constructor(endUsersRequest, walletRequest) {
    this.endUserRequest = endUsersRequest;
    this.walletRequest = walletRequest;
  }

  listEndUsers(req, res, next) {
    var carrierId = req.params.carrierId ? req.params.carrierId.trim() : false;
    if (!carrierId) return next(new Error('missing mandatory field(s)'));

    this.endUserRequest.getUsers(carrierId, function(err, body) {
      res.json(err || body);
    });
  }

  getEndUserDetails(req, res, next) {
    var carrierId = req.params.carrierId ? req.params.carrierId.trim() : false;
    var username = req.params.username ? req.params.username.trim() : false;
    if (!carrierId || !username) return next(new Error('missing mandatory field(s)'));

    var user;

    Q.ninvoke(this.endUserRequest, 'getUser', {
      "carrierId": carrierId,
      "username": username
    }).then((body) => {
      user = _.clone(body);
      return Q.ninvoke(this.walletRequest, 'getWalletBalance', {
        "carrier": user.carrierId,
        "number": user.userDetails.username,
        "sessionUserName": user.userDetails.displayName
      });
    }).then((body) => {
      if (body) {
        user.wallet = _.first(body.result.wallets);
      }
      res.json(user);
    }).catch((err) => {
      res.json({
        error: err
      });
    });
  }

  suspendEndUser(req, res, next) {
    var carrierId = req.params.carrierId ? req.params.carrierId.trim() : false;
    var username = req.params.username ? req.params.username.trim() : false;
    if (!carrierId || !username) return next(new Error('missing mandatory field(s)'));

    this.endUserRequest.suspendUser(carrierId, username, function(err, body) {
      res.json(err || body);
    })
  }

  reactivateEndUser(req, res, next) {
    var carrierId = req.params.carrierId ? req.params.carrierId.trim() : false;
    var username = req.params.username ? req.params.username.trim() : false;
    if (!carrierId || !username) return next(new Error('missing mandatory field(s)'));

    this.endUserRequest.reactivateUser(carrierId, username, function(err, body) {
      res.json(err || body);
    })
  }

  terminateEndUser(req, res, next) {
    var carrierId = req.params.carrierId ? req.params.carrierId.trim() : false;
    var username = req.params.username ? req.params.username.trim() : false;
    if (!carrierId || !username) return next(new Error('missing mandatory field(s)'));

    this.endUserRequest.terminateUser(carrierId, username, function(err, body) {
      res.json(err || body);
    })
  }

  whitelistUsers(req, res, next) {
    var carrierId = req.params.carrierId ? req.params.carrierId.trim() : false;
    var users = [];
    if (!carrierId || users) return next(new Error('missing mandatory field(s)'));

    this.endUserRequest.whitelistUsers(carrierId, users, function(err, body) {
      res.json(err || body);
    });
  }
}
