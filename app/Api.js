import _ from 'lodash';
import assign from 'object-assign';
import superagent from 'superagent';

import { API_PATH_PREFIX, EXPORT_PATH_PREFIX } from './config';
import * as saUtil from './utils/superagent';

const debug = require('debug')('app:api');
const genericHandler = _.partial(saUtil.genericHandler, debug);

const noop = Function.prototype;

/**
 * Api object used in the client-side
 *
 * @param {Object} options = {} mixin functions
 * @param {Function} [options.getHost]
 * @param {Function} [options.getToken]
 */
function Api(options = {}) {
  this._getHost = options.getHost || noop;
  this._getToken = options.getToken || noop;
}

Api.prototype.getAuthorityList = function getAuthorityList(carrierId, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${carrierId}/authority`)
    .set('Authorization', this._getToken())
    .end((err, res) => {
      if (err) {
        cb(err);
        return;
      }

      cb(null, res.body);
      return;
    });
};

Api.prototype.getCompanies = function getCompanies(params, cb) {
  superagent
    .get(`${this._getHost()}/api/companies`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getParentCompanies = function getParentCompanies(params, cb) {
  superagent
    .get(`${this._getHost()}/api/companies/parent`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end((err, res) => {
      if (err) {
        debug('error', err);
      }

      cb(err, res && res.body);
    });
};

Api.prototype.createCompany = function createCompany(params, cb) {
  superagent
    .post(`${this._getHost()}/api/companies`)
    .accept('json')
    .set('Authorization', this._getToken())
    .send(params.data)
    .end(genericHandler(cb));
};

Api.prototype.getCompanyService = function getCompanyService(params, cb) {
  superagent
    .get(`${this._getHost()}/api/companies/${params.carrierId}/service`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query({ userId: params.userId })
    .end(genericHandler(cb));
};

Api.prototype.getCarrierManagingCompanies = function getCarrierManagingCompanies(params, cb) {
  superagent
    .get(`${this._getHost()}/api/companies/${params.carrierId}/managingCompanies`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getApplications = function getApplications(params, cb) {
  superagent
    .get(`${this._getHost()}/api/companies/${params.carrierId}/applications`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getApplicationIds = function getApplicationIds(params, cb) {
  superagent
    .get(`${this._getHost()}/api/companies/${params.carrierId}/applicationIds`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query({ userId: params.userId })
    .end(genericHandler(cb));
};

Api.prototype.updateCompanyProfile = function updateCompanyProfile(params, cb) {
  superagent
    .put(`${this._getHost()}/api/companies/${params.carrierId}/profile`)
    .accept('json')
    .set('Authorization', this._getToken())
    .send(params.data)
    .end(genericHandler(cb));
};

Api.prototype.updateCompanyService = function updateCompanyService(params, cb) {
  superagent
    .put(`${this._getHost()}/api/companies/${params.carrierId}/service`)
    .accept('json')
    .set('Authorization', this._getToken())
    .send(params.data)
    .end(genericHandler(cb));
};

Api.prototype.updateCompanyWidget = function updateCompanyWidget(params, cb) {
  superagent
    .put(`${this._getHost()}/api/companies/${params.carrierId}/widget`)
    .accept('json')
    .set('Authorization', this._getToken())
    .send(params.data)
    .end(genericHandler(cb));
};

Api.prototype.deactivateCompany = function deactivateCompany(params, cb) {
  superagent
    .post(`${this._getHost()}/api/companies/${params.carrierId}/suspension`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end((err, res) => {
      if (err) {
        debug('error', err);
      }

      cb(err, res && res.body);
    });
};

Api.prototype.reactivateCompany = function reactivateCompany(params, cb) {
  superagent
    .put(`${this._getHost()}/api/companies/${params.carrierId}/suspension`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end((err, res) => {
      if (err) {
        debug('error', err);
      }

      cb(err, res && res.body);
    });
};

Api.prototype.getEndUserWallet = function getEndUserWallet(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/users/${params.username}/wallet`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getEndUsers = function getEndUsers(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/users`)
    .query(_.pick(params, ['startDate', 'endDate', 'page']))
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getEndUser = function getEndUser(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/users/${params.username}`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.deactivateEndUser = function deactivateEndUser(params, cb) {
  superagent
    .post(`${this._getHost()}/api/carriers/${params.carrierId}/users/${params.username}/suspension`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.reactivateEndUser = function reactivateEndUser(params, cb) {
  superagent
    .del(`${this._getHost()}/api/carriers/${params.carrierId}/users/${params.username}/suspension`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getSMS = function getSMS(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/sms`)
    .query(params)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getSMSWidgets = function getSMSWidgets(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/widgets/sms`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query({ userId: params.userId })
    .end(genericHandler(cb));
};

Api.prototype.getCalls = function getCalls(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/calls`)
    .query(params)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getCallsWidgets = function getCallsWidgets(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/widgets/calls`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query({ userId: params.userId })
    .end(genericHandler(cb));
};

Api.prototype.getImWidgets = function getImWidgets(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/widgets/im`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query({ userId: params.userId })
    .end(genericHandler(cb));
};

Api.prototype.getOverviewWidgets = function getOverviewWidgets(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/widgets/overview`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query({ userId: params.userId })
    .end(genericHandler(cb));
};

Api.prototype.getTopUpHistory = function getTopUpHistory(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/topup`)
    .query(params)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getImHistory = function getImHistory(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/im`)
    .query(params)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getVerifications = function getVerifications(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/verifications`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query(params)
    .end(genericHandler(cb));
};

Api.prototype.getVerificationStatsByStatus = function getVerificationStatsByStatus(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/verificationStats`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query(_.merge(params, { type: 'success' }))
    .end(genericHandler(cb));
};

Api.prototype.getVerificationStatsByPlatform = function getVerificationStatsByPlatform(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/verificationStats`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query(_.merge(params, { type: 'platform' }))
    .end(genericHandler(cb));
};

Api.prototype.getVerificationStatsByType = function getVerificationStatsByType(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/verificationStats`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query(_.merge(params, { type: 'type' }))
    .end(genericHandler(cb));
};

Api.prototype.getVerificationStatsByCountry = function getVerificationStatsByCountry(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/verificationStats`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query(_.merge(params, { type: 'country' }))
    .end(genericHandler(cb));
};

Api.prototype.getCurrentCompanyInfo = function getCurrentCompanyInfo(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/companies/${params.carrierId}/info`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getEndUsersStatsTotal = function getEndUsersStatsTotal(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/userStatsTotal`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query(params)
    .end(genericHandler(cb));
};

Api.prototype.getEndUsersStatsMonthly = function getEndUsersStatsMonthly(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/userStatsMonthly`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query(params)
    .end(genericHandler(cb));
};

Api.prototype.getEndUsersRegistrationStats = function getEndUsersRegistrationStats(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/stat/user/query`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query(_.assign(params, { type: 'registration' }))
    .end(genericHandler(cb));
};

Api.prototype.getEndUsersDeviceStats = function getEndUsersDeviceStats(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/stat/user/query`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query(_.assign(params, { type: 'device' }))
    .end(genericHandler(cb));
};

Api.prototype.getEndUsersGeographicStats = function getEndUsersGeographicStats(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/stat/user/query`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query(_.assign(params, { type: 'geographic' }))
    .end(genericHandler(cb));
};

Api.prototype.getCallsStatsMonthly = function getCallsStatsMonthly(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/callUserStatsMonthly`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query(params)
    .end(genericHandler(cb));
};

Api.prototype.getCallsStatsTotal = function getCallsStatsTotal(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/callUserStatsTotal`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query(params)
    .end(genericHandler(cb));
};

assign(
  Api.prototype,
  require('./server/api/auth')(API_PATH_PREFIX),
  require('./server/api/session')(API_PATH_PREFIX),
  require('./server/api/accounts')(API_PATH_PREFIX),
  require('./server/api/export')(EXPORT_PATH_PREFIX),
  require('./server/api/vsf')(API_PATH_PREFIX)
);

module.exports = Api;
