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
        .query({ carrierId: this.getCarrierId(), ...params })
        .accept('json')
        .end(genericHandler(cb));
    },
    getAccount(params, cb) {
      superagent
        .get(`${this._getHost()}${apiPrefix}/accounts/${params.id}`)
        .query({ carrierId: this.getCarrierId(), ...params })
        .accept('json')
        .end(genericHandler(cb));
    },
    createAccount(params, cb) {
      superagent
        .post(`${this._getHost()}${apiPrefix}/accounts`)
        .accept('json')
        .query({ carrierId: this.getCarrierId() })
        .send(params)
        .end(genericHandler(cb));
    },

    updateAccount(params, cb) {
      const { id, ...accountInfo } = params;
      superagent
        .put(`${this._getHost()}${apiPrefix}/accounts/${id}`)
        .accept('json')
        .query({ carrierId: this.getCarrierId() })
        .send(accountInfo)
        .end(genericHandler(cb));
    },

    deleteAccount(params, cb) {
      superagent
        .del(`${this._getHost()}${apiPrefix}/accounts/${params.accountId}`)
        .accept('json')
        .query({ carrierId: this.getCarrierId() })
        .end(genericHandler(cb));
    },

    resendCreatePassword(params, cb) {
      superagent
        .put(`${this._getHost()}${apiPrefix}/accounts/reverify/${params.data.username}`)
        .query({ carrierId: this.getCarrierId() })
        .accept('json')
        .end(genericHandler(cb));
    },
  };
}
