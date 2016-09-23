import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/users');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function () {
  return {
    reactivateEndUser(params, cb) {
      superagent
        .del(`${this._getBaseUrl(params.carrierId)}/users/${params.username}/suspension`)
        .accept('json')
        .end(genericHandler(cb));
    },
    deactivateEndUser(params, cb) {
      superagent
        .post(`${this._getBaseUrl(params.carrierId)}/users/${params.username}/suspension`)
        .accept('json')
        .end(genericHandler(cb));
    },
    getEndUser(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/users/${params.username}`)
        .accept('json')
        .end(genericHandler(cb));
    },
    getEndUsers(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/users`)
        .query(_.pick(params, ['startDate', 'endDate', 'page', 'username']))
        .accept('json')
        .end(genericHandler(cb));
    },
    getEndUserWallet(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/users/${params.username}/wallet`)
        .accept('json')
        .end(genericHandler(cb));
    },
    // @TODO update the following routes to be more specific rather than /stat/user/query
    getEndUsersGeographicStats(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/stat/user/query`)
        .accept('json')
        .query(_.assign(params, { type: 'geographic' }))
        .end(genericHandler(cb));
    },
    getEndUsersDeviceStats(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/stat/user/query`)
        .accept('json')
        .query(_.assign(params, { type: 'device' }))
        .end(genericHandler(cb));
    },
    getEndUsersRegistrationStats(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/stat/user/query`)
        .accept('json')
        .query(_.assign(params, { type: 'registration' }))
        .end(genericHandler(cb));
    },
    getEndUsersStatsMonthly(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/userStatsMonthly`)
        .accept('json')
        .query(params)
        .end(genericHandler(cb));
    },
    getEndUsersStatsTotal(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/userStatsTotal`)
        .accept('json')
        .query(params)
        .end(genericHandler(cb));
    },
  };
}
