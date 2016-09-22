import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/overview');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function () {
  return {
    getOverviewSummaryStats(params, cb) {
      const { carrierId, ...otherParams } = params;
      superagent
        .get(`${this._getBaseUrl(carrierId)}/overview/summaryStats`)
        .accept('json')
        .query(otherParams)
        .end(genericHandler(cb));
    },
    getOverviewDetailStats(params, cb) {
      const { carrierId, ...otherParams } = params;
      superagent
        .get(`${this._getBaseUrl(carrierId)}/overview/detailStats`)
        .accept('json')
        .query(otherParams)
        .end(genericHandler(cb));
    },
  };
}
