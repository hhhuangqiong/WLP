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

  showAccounts(req, res, next) {
    res.render('pages/accounts/index', {});
  }

  showHeader(req, res, next) {
    res.render('pages/accounts/header-supplement', {});
  }

  showAccount(req, res) {

    req.checkQuery('carrierId').notEmpty();

    if (req.validationErrors()) throw new Error("missing/invalid mandatory field(s).");

    var carrierId = req.query.carrierId;

    var renderTemplate = (data) => {
      res.render('pages/accounts/account', {
        companies: data.companies,
        groups: data.groups
      });
    };

    var getGroups = function() {
      var deferred = Q.defer();
      setTimeout(function(){
        deferred.resolve([
          {_id: "admin", name: "admin"},
          {_id: "marketing", name: "marketing"}
        ])
      }, 200);
      return deferred.promise;
    };

    var getCompanies = function(criteria) {
      var deferred = Q.defer();
      Company
        .find(criteria)
        .select('_id name')
        .exec((err, companies)=>{
          if (err) throw (err);
          return deferred.resolve(companies);
        });
      return deferred.promise;
    };

    var getCriteria = function(cb) {
      // currently browsing company by default
      var criteria = {'carrierId': carrierId};

      var underRootCompany = function(carrierId) {
        var deferred = Q.defer();
        Company
          .findOne({carrierId: carrierId})
          .exec((err, company) => {
            if (err) throw err;
            deferred.resolve(company.isRoot);
          });
        return deferred.promise;
      };

      var underResellerCompany = function(carrierId) {
        var deferred = Q.defer();
        Company
          .findOne({'carrierId': carrierId})
          .select('_id carrierId reseller')
          .exec((err, company) => {
            if (err) throw err;
            return deferred.resolve(company);
          });

        return deferred.promise;
      };

      underRootCompany(this.carrierId)
        .then((isRootCompany)=>{
          if (isRootCompany) return cb(null, {});
          return underResellerCompany(this.carrierId);
        })
        .then((browsingCompany) => {
          if (!browsingCompany) return cb(new Error('company not found.'));
          if (!browsingCompany.reseller) return cb(null, criteria);
          return cb(null, {$or: [
            {'_id': browsingCompany._id},
            {'parentCompany': browsingCompany._id}
          ]})
        })
        .catch((err)=>{
          logger.error(err);
          return cb(err);
        })
    };

    var getCriteria = _.bind(getCriteria, {
      'carrierId': carrierId
    });

    Q.nfcall(getCriteria)
      .then((criteria)=>{
        return Q.all([
          getCompanies(criteria),
          getGroups()
        ])
        .spread(function(companies, groups) {
          return {
            companies: companies,
            groups: groups
          };
        })
      })
      .then(renderTemplate)
      .catch((err) => {
        logger.error(err);
        next(err);
      });
  }

  showEditForm(req, res, next) {
    res.render('pages/accounts/edit', {});
  }
}
