import logger from 'winston';
import Q from 'q';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';

const Company = require('../../collections/company');
const PortalUser = require('../../collections/portalUser');

/**
 * initialize 'super user' information
 *
 * @param {string} seedFilePath path to the seed file
 */
function initialize(seedFilePath) {
  let content;

  try {
    content = JSON.parse(fs.readFileSync(seedFilePath, {
      encoding: 'utf8',
    }));
  } catch (e) {
    throw new Error('Error parsing data seed file');
  }

  function insertData(data) {
    let affiliatedCompanyId;
    const rootUser = data.user;
    const hashInfo = Q.nbind(PortalUser.hashInfo, PortalUser);

    function seedUser() {
      return hashInfo(rootUser.password).then(hashResult => {
        const extra = {
          affiliatedCompany: affiliatedCompanyId,
        };

        logger.info(`Seeding user ${rootUser.username}`);
        return Q.ninvoke(PortalUser, 'create', _.merge(rootUser, hashResult, extra));
      });
    }

    function seedCompany(companyInfo) {
      const condition = {
        name: companyInfo.name,
      };

      const opts = {
        new: true,
        upsert: true,
      };

      return Q.ninvoke(Company, 'findOneAndUpdate', condition, companyInfo, opts);
    }

    function addLogo(model) {
      if (!data.company.logoFile) {
        return Q(true);
      }

      return Q.ninvoke(
        model,
        'addLogo',
        path.join(__dirname, `../../../public/images/${data.company.logoFile}`),
        {}
      );
    }

    function infoLogger(model) {
      logger.info('Seeded: %j', model, {});
    }

    function putAffiliateIdInScope(company) {
      affiliatedCompanyId = company.id;
      logger.info(`Put affiliatedCompany in scope ${affiliatedCompanyId}`);
      return company;
    }

    seedCompany(data.company)
      .then(putAffiliateIdInScope)
      .then(addLogo)
      .then(infoLogger)
      .then(seedUser)
      .then(infoLogger)
      .catch(error => {
        logger.error('Error during data seeding', error.stack);
      });
  }

  content.forEach(data => {
    // assume there can only have 1 and only 1 root user
    PortalUser.findOne({
      username: data.user.username,
    }, (err, user) => {
      if (err) {
        throw err;
      }

      if (user) {
        logger.info(`${data.user.username} user already exists; not seeding`);
        return;
      }

      insertData(data);
    });
  });
}

module.exports = initialize;
