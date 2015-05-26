var _       = require('lodash');
var Q       = require('q');
var logger  = require('winston');

var Company = require('../../collections/company');

export default class AccountController {

  constructor(portalUserManager) {
    this.portalUserManager = portalUserManager;
  }

  getAccounts(req, res, next) {
    var query = req.query;

    Q.ninvoke(this.portalUserManager, 'getUsers', query)
      .then(function (users) {
        res.json({
          "result": users ? users : false
        });
      }).catch(function (err) {
        res.json({
          "error": err
        });
      });
  }

  createAccount(req, res, next) {
    var conditions = req.body;
    var author = req.user;
    // user hasn't logged in
    if (!req.user) {
      res.json({
        "result": {},
        "message": 'Invalid permission'
      });
    }
    Q.ninvoke(this.portalUserManager, 'newUser', conditions, author)
      .then(function (user) {
        res.json({
          "user": user ? user : false
        });
      }).catch(function (err) {
        res.json({
          "error": err
        });
      });
  }

}
