import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/accounts');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function (apiPrefix = '') {
  return {
    getAccounts(params, cb) {
      superagent
        .get(`${this._getHost()}${apiPrefix}/accounts`)
        .query(params)
        .accept('json')
        .end(genericHandler(cb));
    },
    getAccount(params, cb) {
      superagent
        .get(`${this._getHost()}${apiPrefix}/accounts/${params.id}`)
        .query(params)
        .accept('json')
        .end(genericHandler(cb));
    },
    createAccount(params, cb) {
      superagent
        .post(`${this._getHost()}${apiPrefix}/accounts`)
        .accept('json')
        .send(params.data)
        .end(genericHandler(cb));
    },

    updateAccount(params, cb) {
      superagent
        .put(`${this._getHost()}${apiPrefix}/accounts/${params.data.id}`)
        .accept('json')
        .send(_.omit(params.data, 'id'))
        .end(genericHandler(cb));
    },

    deleteAccount(params, cb) {
      superagent
        .del(`${this._getHost()}${apiPrefix}/accounts/${params.accountId}`)
        .accept('json')
        .end(genericHandler(cb));
    },

    verifyAccountToken(params, cb) {
      superagent
        .get(`${this._getHost()}${apiPrefix}/accounts/verify/${params.token}`)
        .accept('json')
        .end(genericHandler(cb));
    },

    setPassword(params, cb) {
      superagent
        .put(`${this._getHost()}${apiPrefix}/accounts/verify/${params.token}`)
        .accept('json')
        .send(params)
        .end(genericHandler(cb));
    },

    changePassword(params, cb) {
      superagent
        .post(`${this._getHost()}${apiPrefix}/accounts/change-password`)
        .accept('json')
        .send(params)
        .end(genericHandler(cb));
    },

    resendCreatePassword(params, cb) {
      superagent
        .put(`${this._getHost()}${apiPrefix}/accounts/reverify/${params.data.username}`)
        .accept('json')
        .end(genericHandler(cb));
    },
  };
}
