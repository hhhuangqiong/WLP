/// <reference path='../../../typings/winston/winston.d.ts' />
var logger = require('winston');
var Q = require('q');
var _ = require('lodash');
var fs = require('fs');
var Company = require('app/collections/company');
var PortalUser = require('app/collections/portalUser');
function initialize(seedFilePath) {
    // assume there can only have 1 and only 1 root user
    PortalUser.findOne({ isRoot: true }, function (err, user) {
        if (err)
            throw err;
        if (!user) {
            // read file content; blocking
            var content = JSON.parse(fs.readFileSync(seedFilePath, { encoding: 'utf8' }));
            var rootUser = content.rootUser;
            var hashInfo = Q.nbind(PortalUser.hashInfo, PortalUser);
            var seedUser = function (hashInfo) {
                return Q.ninvoke(PortalUser, 'create', _.merge(rootUser, hashInfo));
            };
            var seedCompany = function () {
                var companyInfo = content.rootCompany;
                var criteria = { name: companyInfo.name };
                return Q.ninvoke(Company, 'findOneAndUpdate', criteria, companyInfo, { upsert: true });
            };
            var infoLogger = function (model) {
                logger.info('Seeded: %j', model, {});
            };
            hashInfo(rootUser.password).then(seedUser).then(infoLogger).then(seedCompany).then(infoLogger).catch(function (err) {
                logger.error('Error during data seeding', err.stack);
            });
        }
    });
}
module.exports = initialize;
