import _ from 'lodash';
import superagent from 'superagent';

import accountsRouter from './server/api/accounts';
import exportRouter from './server/api/export';
import vsfRouter from './server/api/vsf';
import roleRouter from './server/api/roles';

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
  this.getCarrierId = options.getCarrierId;
}

Api.prototype.createProvision = function createProvision(params, cb) {
  superagent
    .post(`${this._getHost()}/api/provisioning`)
    .query({ carrierId: this.getCarrierId() })
    .set('Content-Type', 'application/json')
    .send(params)
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.getProvisions = function getProvisions(params, cb) {
  superagent
    .get(`${this._getHost()}/api/provisioning/`)
    .query({
      searchCompany: params.searchCompany,
      pageSize: params.pageSize,
      pageNumber: params.pageNumber,
      carrierId: this.getCarrierId(),
    })
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.updateProvision = function updateProvision(params, cb) {
  const { provisionId, ...restCompanyInfo } = params;
  superagent
    .put(`${this._getHost()}/api/provisioning/${provisionId}`)
    .query({ carrierId: this.getCarrierId() })
    .set('Content-Type', 'application/json')
    .send(restCompanyInfo)
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.getProvision = function getProvision(params, cb) {
  superagent
    .get(`${this._getHost()}/api/provisioning/${params}`)
    .query({ carrierId: this.getCarrierId() })
    .accept('json')
    .end(genericHandler(cb));
};


Api.prototype.getPreset = function getPreset(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/preset`)
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.getManagingCompanies = function getManagingCompanies(params, cb) {
  superagent
    .get(`${this._getHost()}/api/companies/${params.companyId}/managingCompanies`)
    .query({ carrierId: this.getCarrierId() })
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.updateCompanyProfile = function updateCompanyProfile(params, cb) {
  const { companyId, ...restCompanyInfo } = params;
  superagent
    .put(`${this._getHost()}/api/companies/${companyId}/profile`)
    .query({ carrierId: this.getCarrierId() })
    .accept('json')
    .send(restCompanyInfo)
    .end(genericHandler(cb));
};

Api.prototype.deactivateCompany = function deactivateCompany(params, cb) {
  superagent
    .post(`${this._getHost()}/api/companies/${params.companyId}/suspension`)
    .query({ carrierId: this.getCarrierId() })
    .accept('json')
    .end((err, res) => {
      if (err) {
        debug('error', err);
      }

      cb(err, res && res.body);
    });
};

Api.prototype.reactivateCompany = function reactivateCompany(params, cb) {
  superagent
    .put(`${this._getHost()}/api/companies/${params.companyId}/suspension`)
    .query({ carrierId: this.getCarrierId() })
    .accept('json')
    .end((err, res) => {
      if (err) {
        debug('error', err);
      }

      cb(err, res && res.body);
    });
};

Api.prototype.getApplications = function getApplications(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/applications`)
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.getApplicationIds = function getApplicationIds(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/applicationIds`)
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.getEndUserWallet = function getEndUserWallet(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/users/${params.username}/wallet`)
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.getEndUsers = function getEndUsers(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/users`)
    .query(_.pick(params, ['startDate', 'endDate', 'page']))
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.getEndUser = function getEndUser(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/users/${params.username}`)
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.deactivateEndUser = function deactivateEndUser(params, cb) {
  superagent
    .post(`${this._getHost()}/api/carriers/${params.carrierId}/users/${params.username}/suspension`)
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.reactivateEndUser = function reactivateEndUser(params, cb) {
  superagent
    .del(`${this._getHost()}/api/carriers/${params.carrierId}/users/${params.username}/suspension`)
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.getSMS = function getSMS(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/sms`)
    .query(params)
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.getSmsSummaryStats = function getSmsSummaryStats(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/sms/overview/summaryStats`)
    .accept('json')
    .query(params)
    .end(genericHandler(cb));
};

Api.prototype.getSmsMonthlyStats = function getSmsMonthlyStats(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/sms/overview/monthlyStats`)
    .accept('json')
    .query(params)
    .end(genericHandler(cb));
};

Api.prototype.getCalls = function getCalls(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/calls`)
    .query(params)
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.getOverviewSummaryStats = function getOverviewSummaryStats(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/overview/summaryStats`)
    .accept('json')
    .query(params)
    .end(genericHandler(cb));
};

Api.prototype.getOverviewDetailStats = function getOverviewDetailStats(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/overview/detailStats`)
    .accept('json')
    .query(params)
    .end(genericHandler(cb));
};

Api.prototype.getTopUpHistory = function getTopUpHistory(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/topup`)
    .query(params)
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.getImHistory = function getImHistory(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/im`)
    .query(params)
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.getVerifications = function getVerifications(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/verifications`)
    .accept('json')
    .query(params)
    .end(genericHandler(cb));
};

Api.prototype.getVerificationStatsByStatus = function getVerificationStatsByStatus(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/verificationStats`)
    .accept('json')
    .query(_.merge(params, { type: 'success' }))
    .end(genericHandler(cb));
};

Api.prototype.getVerificationStatsByPlatform = function getVerificationStatsByPlatform(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/verificationStats`)
    .accept('json')
    .query(_.merge(params, { type: 'platform' }))
    .end(genericHandler(cb));
};

Api.prototype.getVerificationStatsByType = function getVerificationStatsByType(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/verificationStats`)
    .accept('json')
    .query(_.merge(params, { type: 'type' }))
    .end(genericHandler(cb));
};

Api.prototype.getVerificationStatsByCountry = function getVerificationStatsByCountry(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/verificationStats`)
    .accept('json')
    .query(_.merge(params, { type: 'country' }))
    .end(genericHandler(cb));
};

Api.prototype.getEndUsersStatsTotal = function getEndUsersStatsTotal(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/userStatsTotal`)
    .accept('json')
    .query(params)
    .end(genericHandler(cb));
};

Api.prototype.getEndUsersStatsMonthly = function getEndUsersStatsMonthly(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/userStatsMonthly`)
    .accept('json')
    .query(params)
    .end(genericHandler(cb));
};

Api.prototype.getEndUsersRegistrationStats = function getEndUsersRegistrationStats(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/stat/user/query`)
    .accept('json')
    .query(_.assign(params, { type: 'registration' }))
    .end(genericHandler(cb));
};

Api.prototype.getEndUsersDeviceStats = function getEndUsersDeviceStats(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/stat/user/query`)
    .accept('json')
    .query(_.assign(params, { type: 'device' }))
    .end(genericHandler(cb));
};

Api.prototype.getEndUsersGeographicStats = function getEndUsersGeographicStats(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/stat/user/query`)
    .accept('json')
    .query(_.assign(params, { type: 'geographic' }))
    .end(genericHandler(cb));
};

Api.prototype.getCallsStatsMonthly = function getCallsStatsMonthly(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/callUserStatsMonthly`)
    .accept('json')
    .query(params)
    .end(genericHandler(cb));
};

Api.prototype.getCallsStatsTotal = function getCallsStatsTotal(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/callUserStatsTotal`)
    .accept('json')
    .query(params)
    .end(genericHandler(cb));
};

Api.prototype.getVsfSummaryStats = function getVsfSummaryStats(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/vsf/overview/summaryStats`)
    .accept('json')
    .query(params)
    .end(genericHandler(cb));
};

Api.prototype.getVsfMonthlyStats = function monthlyStats(params, cb) {
  return superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/vsf/overview/monthlyStats`)
    .accept('json')
    .query(params)
    .end(genericHandler(cb));
};

_.assign(
  Api.prototype,
  accountsRouter(API_PATH_PREFIX),
  exportRouter(EXPORT_PATH_PREFIX),
  vsfRouter(API_PATH_PREFIX),
  roleRouter(API_PATH_PREFIX),
);

module.exports = Api;
