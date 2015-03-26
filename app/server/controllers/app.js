var _ = require('lodash');
var Q = require('q');
var Company = require('app/collections/company');

export default {
  showLayout: function(req, res, next) {
    var renderTemplate = (data) => {
      res.render('layout/admin-layout', {
        userName: req.user.name,
        companies: data.companies
      });
    };

    var getCompanies = function(criteria) {
      var deferred = Q.defer();
      Company
        .find(criteria)
        .select('name carrierId')
        .exec((err, companies) => {
          if (err) throw err;
          return deferred.resolve(companies);
        });
      return deferred.promise;
    };

    var getCriteria = function(cb) {
      // user's own company by default
      var criteria = {'_id': this.affiliatedCompany};

      if (this.isRoot) return cb(null, {});

      var isReseller = function(companyId) {
        var deferred = Q.defer();
        Company
          .findOne({'_id': companyId})
          .select('reseller')
          .exec((err, company) => {
            if (err || !company) throw err;
            return deferred.resolve(company.reseller);
          });
        return deferred.promise;
      };

      isReseller(this.affiliatedCompany)
        .then((isReseller)=>{
          if (isReseller) {
            return cb(null, { $or: [
              {'_id': this.affiliatedCompany},
              {'parentCompany': this.affiliatedCompany}
            ]});
          } else {
            return cb(null, criteria);
          }
        })
        .catch((err)=>{
          logger.error(err);
          return cb(err);
        })
    };

    var getCriteria = _.bind(getCriteria, req.user);

    Q.nfcall(getCriteria)
      .then((criteria)=>{
        return Q.all([
            getCompanies(criteria)
          ])
          .spread(function(companies) {
            return {
              companies: companies
            };
          })
      })
      .then(renderTemplate)
      .catch((err) => {
        logger.error(err);
        next(err);
      })
  }
}
