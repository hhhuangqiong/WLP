import _ from 'lodash';
import superagent from 'superagent';

import {
  exportApi, vsfApi, roleApi, carrierWalletApi, imApi, callApi,
  provisioningApi, smsApi, userApi, verificationApi, topUpApi, overviewApi, resourceApi,
} from './server/api';

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
}

Api.prototype._getBaseUrl = function getBaseUrl(carrierId, prefix = API_PATH_PREFIX) {
  if (!_.isString(carrierId)) {
    throw new Error('Unable to prepend carrier id to the API url.');
  }
  return `${this._getHost()}${prefix}/carriers/${carrierId}`;
};

// following one are the general one based on the carriers
Api.prototype.updateCarrierProfile = function updateCarrierProfile(params, cb) {
  const { carrierId, companyId, ...profile } = params;
  superagent
    .put(`${this._getBaseUrl(carrierId)}/company/${companyId}/profile`)
    .accept('json')
    .send(profile)
    .end(genericHandler(cb));
};

Api.prototype.getPreset = function getPreset(params, cb) {
  superagent
    .get(`${this._getBaseUrl(params.carrierId)}/preset`)
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.getApplications = function getApplications(params, cb) {
  superagent
    .get(`${this._getBaseUrl(params.carrierId)}/applications`)
    .accept('json')
    .end(genericHandler(cb));
};

Api.prototype.getApplicationIds = function getApplicationIds(params, cb) {
  superagent
    .get(`${this._getBaseUrl(params.carrierId)}/applicationIds`)
    .accept('json')
    .end(genericHandler(cb));
};

_.assign(
  Api.prototype,
  exportApi(EXPORT_PATH_PREFIX),
  provisioningApi(),
  vsfApi(),
  roleApi(),
  carrierWalletApi(),
  smsApi(),
  userApi(),
  verificationApi(),
  topUpApi(),
  imApi(),
  overviewApi(),
  callApi(),
  resourceApi(),
);

module.exports = Api;
