import logger from 'winston';
import request from 'superagent';
import util from 'util';
import _ from 'lodash';
import qs from 'qs';
import { ConnectionError } from 'common-errors';

import { ALL_TYPES_EXCEPT_TESTING } from '../constants/call';
import { constructOpts, swapDate, handleError } from '../helper';
import equals from 'shallow-equals';

const REQUEST_TYPE = {
  CALLS: 'CALLS',
  CALLERS: 'CALLERS',
  CALLEES: 'CALLEES',
};

export default class CallStatsRequest {
  constructor(baseUrl, timeout) {
    const opts = {
      type: 'dataProviderApi',
      baseUrl,
      timeout,
      endpoints: {
        CALLERS: {
          PATH: '/stats/1.0/sip/callers',
          METHOD: 'GET',
        },
        CALLEES: {
          PATH: '/stats/1.0/sip/callees',
          METHOD: 'GET',
        },
        CALLS: {
          PATH: '/stats/1.0/sip/query',
          METHOD: 'GET',
        },
      },
    };

    this.opts = constructOpts(opts);
  }

  normalizeData(type, params) {
    logger.debug('normalizeData', params);

    try {
      const date = swapDate(params);
      const query = {
        from: params.from,
        to: params.to,
        type: date.type || ALL_TYPES_EXCEPT_TESTING.join(','),
        caller_carrier: date.caller_carrier,
        timescale: date.timescale,
        timeWindow: date.timeWindow,
        breakdown: date.breakdown,
        status: date.status,
        countries: date.countries,
        stat_type: date.stat_type,
      };
      return _.omit(query, value => !value);
    } catch (err) {
      throw handleError(err, 500);
    }
  }

  async sendRequest(endpoint, params, loadBalanceIndex = 0) {
    let baseUrl = this.opts.baseUrl;
    const baseUrlArray = baseUrl.split(',');

    if (baseUrlArray.length > 1) {
      const index = loadBalanceIndex % baseUrlArray.length;
      baseUrl = baseUrlArray[index];
    } else {
      baseUrl = _.first(baseUrlArray);
    }

    const reqUrl = util.format('%s%s', baseUrl, endpoint.PATH);

    logger.debug(`SIP Statistic API Endpoint: ${reqUrl}?${qs.stringify(params)}`);

    try {
      const req = request(endpoint.METHOD, reqUrl).query(params).buffer().timeout(this.opts.timeout);
      const res = await req;
      return _.get(res, 'body');
    } catch (err) {
      logger.error(`Request to ${endpoint.METHOD} ${reqUrl} failed`, err);
      throw handleError(err, err.status || 400);
    }
  }

  async getCallStats(params) {
    const query = this.normalizeData(REQUEST_TYPE.CALLS, params);
    const callStats = await this.sendRequest(this.opts.endpoints.CALLS, query);
    return callStats.results;
  }

  async getCallerStats(params) {
    const query = this.normalizeData(REQUEST_TYPE.CALLERS, params);

    const callerStats = await this.sendRequest(this.opts.endpoints.CALLERS, query);

    // init the data array with segment
    // assume that the returned results are always with the
    // same order of segment
    const output = _.map(callerStats.results, result => (
      { segment: _.get(result, 'segment'), data: [] }
    ));

    // map the data into the data key in output
    _.forEach(callerStats.results, (value, index) => {
      if (value && value.data) {
        _.forEach(value.data, record => {
          output[index]
            .data
            .push(record);
        });
      }
    });
    return output;
  }

  async getCalleeStats(params) {
    const query = this.normalizeData(REQUEST_TYPE.CALLEES, params);

    const calleeStats = await this.sendRequest(this.opts.endpoints.CALLEES, query);

    // init the data array with segment
    // assume that the returned results are always with the
    // same order of segment
    const output = _.map(calleeStats.results, result => (
      { segment: _.get(result, 'segment'), data: [] }
    ));
    // map the data into the data key in output
    _.forEach(calleeStats.results, (value, index) => {
      if (value && value.data) {
        _.forEach(value.data, record => {
          output[index]
            .data
            .push(record);
        });
      }
    });
    return output;
  }
}
