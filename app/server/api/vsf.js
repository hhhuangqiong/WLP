import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/vsf');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function (apiPrefix) {
  return {
    getVSFTransactions(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId, apiPrefix)}/vsf`)
        .query(params)
        .accept('json')
        .end(genericHandler(cb));
    },
    getVsfMonthlyStats(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId, apiPrefix)}/vsf/overview/monthlyStats`)
        .accept('json')
        .query(params)
        .end(genericHandler(cb));
    },
    getVsfSummaryStats(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId, apiPrefix)}/vsf/overview/summaryStats`)
        .accept('json')
        .query(params)
        .end(genericHandler(cb));
    },
  };
}
