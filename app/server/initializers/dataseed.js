'use strict';
var logger = require('winston');
var Q = require('q');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var Company = require('../../collections/company');
var PortalUser = require('../../collections/portalUser');

/**
 * initialize 'super user' information
 *
 * @param {string} seedFilePath path to the seed file
 */
function initialize(seedFilePath) {
  var content;
  try {
    content = JSON.parse(fs.readFileSync(seedFilePath, {
      encoding: 'utf8'
    }));
  } catch (e) {
    throw new Error('Error parsing data seed file');
  }

  var insertData = function(data) {

    var affiliatedCompanyId;
    var rootUser = data.user;
    var hashInfo = Q.nbind(PortalUser.hashInfo, PortalUser);
    var seedUser = function() {

      return hashInfo(rootUser.password).then(function(hashResult) {
        var extra = {
          affiliatedCompany: affiliatedCompanyId
        };
        logger.info("Seeding user " +  rootUser.username);
        return Q.ninvoke(PortalUser, 'create', _.merge(rootUser, hashResult, extra));
      });

    };
    var seedCompany = function(companyInfo) {
      var condition = {
        name: companyInfo.name
      };
      var opts = {
        new: true,
        upsert: true
      };
      return Q.ninvoke(Company, 'findOneAndUpdate', condition, companyInfo, opts);
    };
    function addLogo(model) {
      return Q.ninvoke(model, 'addLogo', path.join(__dirname, `../../../public/images/${data.company.logoFile}`), {});
    };
    var infoLogger = function(model) {
      logger.info('Seeded: %j', model, {});
    };
    var putAffiliateIdInScope = function(company) {
      affiliatedCompanyId = company.id;
      logger.info("Putted affiliatedCompany in scope "+ affiliatedCompanyId);
      return company;
    };

    seedCompany(data.company)
      .then(putAffiliateIdInScope)
      .then(addLogo)
      .then(infoLogger)
      .then(seedUser)
      .then(infoLogger)
      .catch(function(error) {
        logger.error('Error during data seeding', error.stack);
      });
  };

  content.forEach(function(data) {

    // assume there can only have 1 and only 1 root user
    PortalUser.findOne({
      username: data.user.username
    }, function(err, user) {
      if (err) {
        throw err;
      }

      if (user) {
        logger.info('`' + data.user.username + '` user already exists; not seeding');
        return;
      }

      insertData(data);
    });
  });
}

module.exports = initialize;
