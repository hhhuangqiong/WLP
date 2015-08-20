import _ from 'lodash';
import assign from 'object-assign';
import superagent from 'superagent';

import { API_PATH_PREFIX, EXPORT_PATH_PREFIX } from './config';
import * as saUtil from './utils/superagent'

let debug = require('debug')('app:api');
let genericHandler = _.partial(saUtil.genericHandler, debug);

let noop = Function.prototype;

/**
 * Api object used in the client-side
 *
 * @param {Object} options = {} mixin functions
 * @param {Function} [options.getHost]
 * @param {Function} [options.getToken]
 */
function Api(options = {}) {
  this._getHost   = options.getHost || noop;
  this._getToken  = options.getToken || noop;
}

Api.prototype.getManagingCompanies = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/application/companies`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query({ userId: params.userId })
    .end(genericHandler(cb));
};

Api.prototype.getCompanies = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/companies`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getParentCompanies = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/companies/parent`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(function(err, res) {
      if (err) {
        debug('error', err);
      }

      cb(err, res && res.body);
    });
};

Api.prototype.createCompany = function(params, cb) {
  superagent
    .post(`${this._getHost()}/api/companies`)
    .accept('json')
    .set('Authorization', this._getToken())
    .send(params.data)
    .end(genericHandler(cb));
};

Api.prototype.getCompanyService = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/companies/${params.carrierId}/service`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query({ userId: params.userId })
    .end(genericHandler(cb))
};

Api.prototype.getApplications = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/companies/${params.carrierId}/applications`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb))
};

Api.prototype.updateCompanyProfile = function(params, cb) {
  superagent
    .put(`${this._getHost()}/api/companies/${params.carrierId}/profile`)
    .accept('json')
    .set('Authorization', this._getToken())
    .send(params.data)
    .end(genericHandler(cb));
};

Api.prototype.updateCompanyService = function(params, cb) {
  superagent
    .put(`${this._getHost()}/api/companies/${params.carrierId}/service`)
    .accept('json')
    .set('Authorization', this._getToken())
    .send(params.data)
    .end(genericHandler(cb));
};

Api.prototype.updateCompanyWidget = function(params, cb) {
  superagent
    .put(`${this._getHost()}/api/companies/${params.carrierId}/widget`)
    .accept('json')
    .set('Authorization', this._getToken())
    .send(params.data)
    .end(genericHandler(cb));
};

Api.prototype.deactivateCompany = function(params, cb) {
  superagent
    .post(`${this._getHost()}/api/companies/${params.carrierId}/suspension`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(function(err, res) {
      if (err) {
        debug('error', err);
      }

      cb(err, res && res.body);
    });
};

Api.prototype.reactivateCompany = function(params, cb) {
  superagent
    .put(`${this._getHost()}/api/companies/${params.carrierId}/suspension`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(function(err, res) {
      if (err) {
        debug('error', err);
      }

      cb(err, res && res.body);
    });
};

Api.prototype.getEndUserWallet = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/users/${params.username}/wallet`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getEndUsers = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/users`)
    .query(_.pick(params, ['startDate', 'endDate', 'page']))
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getEndUser = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/users/${params.username}`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.deactivateEndUser = function(params, cb) {
  superagent
    .post(`${this._getHost()}/api/carriers/${params.carrierId}/users/${params.username}/suspension`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb))
};

Api.prototype.reactivateEndUser = function(params, cb) {
  superagent
    .del(`${this._getHost()}/api/carriers/${params.carrierId}/users/${params.username}/suspension`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb))
};

Api.prototype.deleteEndUser = function(params, cb) {
  superagent
    .del(`${this._getHost()}/api/carriers/${params.carrierId}/users/${params.username}`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb))
};

Api.prototype.getSMS = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/sms`)
    .query(params)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getSMSWidgets = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/widgets/sms`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query({ userId: params.userId })
    .end(genericHandler(cb));
};

Api.prototype.getCalls = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/calls`)
    .query(params)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getCallsWidgets = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/widgets/calls`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query({ userId: params.userId })
    .end(genericHandler(cb));
};

Api.prototype.getImWidgets = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/widgets/im`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query({ userId: params.userId })
    .end(genericHandler(cb));
};

Api.prototype.getOverviewWidgets = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/widgets/overview`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query({ userId: params.userId })
    .end(genericHandler(cb));
};

Api.prototype.getTopUpHistory = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/topup`)
    .query(params)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getImHistory = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/im`)
    .query(params)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

Api.prototype.getCurrentCompanyInfo = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/companies/${params.carrierId}/info`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(genericHandler(cb));
};

assign(
  Api.prototype,
  require('./server/api/auth')(API_PATH_PREFIX),
  require('./server/api/session')(API_PATH_PREFIX),
  require('./server/api/export')(EXPORT_PATH_PREFIX),
  require('./server/api/vsf')(API_PATH_PREFIX)
);

module.exports = Api;
