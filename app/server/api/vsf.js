import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/vsf');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function () {
  return {
    getVSFTransactions(params, cb) {
      return superagent
        .get(`${this._getBaseUrl(params.carrierId)}/vsf`)
        .query(params)
        .accept('json')
        .end(genericHandler(cb));
    },
  };
}
