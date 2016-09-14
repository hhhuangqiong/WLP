import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/carrierWallet');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function () {
  return {
    getWallets(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/wallets`)
        .accept('json')
        .end(genericHandler(cb));
    },
    getTopUpRecords(params, cb) {
      const { carrierId, ...query } = params;
      superagent
        .get(`${this._getBaseUrl(carrierId)}/topUpRecords`)
        .query(query)
        .accept('json')
        .end(genericHandler(cb));
    },
    createTopUpRecord(params, cb) {
      const { carrierId, ...body } = params;
      superagent
        .post(`${this._getBaseUrl(carrierId)}/topUpRecords`)
        .send(body)
        .accept('json')
        .end(genericHandler(cb));
    },
  };
}
