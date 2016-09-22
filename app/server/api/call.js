import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/vsf');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function () {
  return {
    // @TODO update the path to be RESTFUL
    getCallsStatsTotal(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/callUserStatsTotal`)
        .accept('json')
        .query(params)
        .end(genericHandler(cb));
    },
    getCallsStatsMonthly(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/callUserStatsMonthly`)
        .accept('json')
        .query(params)
        .end(genericHandler(cb));
    },
    getCalls(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/calls`)
        .query(params)
        .accept('json')
        .end(genericHandler(cb));
    },
  };
}
