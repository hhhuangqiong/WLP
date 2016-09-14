import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/accounts');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function () {
  return {
    getAccounts(params, cb) {
      superagent
        .get(`${this._getBaseUrl()}/accounts`)
        .query(params)
        .accept('json')
        .end(genericHandler(cb));
    },
    getAccount(params, cb) {
      superagent
        .get(`${this._getBaseUrl()}/accounts/${params.id}`)
        .query(params)
        .accept('json')
        .end(genericHandler(cb));
    },
    createAccount(params, cb) {
      superagent
        .post(`${this._getBaseUrl()}/accounts`)
        .accept('json')
        .send(params)
        .end(genericHandler(cb));
    },

    updateAccount(params, cb) {
      const { id, ...accountInfo } = params;
      superagent
        .put(`${this._getBaseUrl()}/accounts/${id}`)
        .accept('json')
        .send(accountInfo)
        .end(genericHandler(cb));
    },

    deleteAccount(params, cb) {
      superagent
        .del(`${this._getBaseUrl()}/accounts/${params.accountId}`)
        .accept('json')
        .end(genericHandler(cb));
    },

    resendCreatePassword(params, cb) {
      superagent
        .put(`${this._getBaseUrl()}/accounts/reverify/${params.data.username}`)
        .accept('json')
        .end(genericHandler(cb));
    },
  };
}
