export default class Api {

  constructor(endUsersRequest) {
    this.endUserRequest = endUsersRequest;
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

    this.endUserRequest.getUser(carrierId, username, function(err, body) {
      res.json(err || body);
    })
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
