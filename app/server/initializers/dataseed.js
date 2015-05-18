'use strict';
var logger     = require('winston');
var Q          = require('q');
var _          = require('lodash');
var fs         = require('fs');

var Company    = require('../../collections/company');
var PortalUser = require('../../collections/portalUser');

/**
 * initialize 'super user' information
 *
 * @param {string} seedFilePath path to the seed file
 */
function initialize(seedFilePath) {
  var content;
  try {
    content = JSON.parse(fs.readFileSync(seedFilePath, { encoding: 'utf8' }));
  } catch (e) {
    throw new Error('Error parsing data seed file');
  }

  // assume there can only have 1 and only 1 root user
  PortalUser.findOne({ isRoot: true }, function (err, user) {
    if (err) { throw err; }

    if(user)  {
      logger.info('`root` user already exists; not seeding');
      return;
    }

    var affiliatedCompanyId;
    var rootUser = content.user;
    var hashInfo = Q.nbind(PortalUser.hashInfo, PortalUser);
    var seedUser = function (hashResult) {
        var extra = { affiliatedCompany: affiliatedCompanyId };
        return Q.ninvoke(PortalUser, 'create', _.merge(rootUser, hashResult, extra));
    };
    var seedCompany = function (companyInfo) {
      var condition = { name: companyInfo.name };
      var opts      = { new: true, upsert: true };
      return Q.ninvoke(Company, 'findOneAndUpdate', condition, companyInfo, opts);
    };
    var infoLogger = function (model) {
      logger.info('Seeded: %j', model, {});
    };
    var putAffiliateIdInScope = function(company) {
      affiliatedCompanyId = company.id;
      return company;
    };

    seedCompany(content.company)
      .then(putAffiliateIdInScope)
      .then(infoLogger)
      .then(hashInfo(rootUser.password))
      .then(seedUser)
      .then(infoLogger)
      .catch(function (error) {
        logger.error('Error during data seeding', error.stack);
    });
  });
}

module.exports = initialize;
