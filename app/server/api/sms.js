import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/vsf');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function () {
  return {
    getSMS(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/sms`)
        .query(params)
        .accept('json')
        .end(genericHandler(cb));
    },
    getSmsMonthlyStats(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/sms/overview/monthlyStats`)
        .accept('json')
        .query(params)
        .end(genericHandler(cb));
    },
    getSmsSummaryStats(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/sms/overview/summaryStats`)
        .accept('json')
        .query(params)
        .end(genericHandler(cb));
    },
  };
}
