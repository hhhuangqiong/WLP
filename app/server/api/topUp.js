import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/topup');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function () {
  return {
    getTopUpHistory(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/topup`)
        .query(params)
        .accept('json')
        .end(genericHandler(cb));
    },
  };
}
