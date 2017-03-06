import logger from 'winston';
import request from 'superagent';
import util from 'util';
import _ from 'lodash';
import moment from 'moment';
import qs from 'qs';
import { constructOpts, swapDate, handleError } from '../helper';
import jsonSchema from '../../../utils/getSimplifiedJsonSchema.js';

const REQUEST_TYPE = {
  USER: 'USER',
  NEW_USERS: 'NEW_USERS',
  ACTIVE_USERS: 'ACTIVE_USERS',
};

export default class UserStatsRequest {
  constructor(baseUrl, timeout) {
    const opts = {
      type: 'dataProviderApi',
      baseUrl,
      timeout,
      endpoints: {
        USER: {
          PATH: '/stats/1.0/user/query',
          METHOD: 'GET',
        },
        NEW_USERS: {
          PATH: '/stats/1.0/user/new_users',
          METHOD: 'GET',
        },
        ACTIVE_USERS: {
          PATH: '/stats/1.0/active_users/im-active-users-statistics',
          METHOD: 'GET',
        },
      },
    };

    this.opts = constructOpts(opts);
  }

  normalizeData(type, params) {
    logger.debug('normalizeData', params);

    try {
      const data = swapDate(params);
      let query = {};

      // for active user query API and new user API,
      // they return the -1 day stat from the `from` query
      // e.g. when I passed 12th Nov as `from` query,
      // the data is actually from 11th Nov but not 12th
      // that why we have to silently add one day before
      // sending out the request
      if (type === REQUEST_TYPE.NEW_USERS || type === REQUEST_TYPE.ACTIVE_USERS) {
        query.from = moment(params.from, 'x').add(1, 'day').startOf('day').format('x');
        query.to = moment(params.to, 'x').add(1, 'day').endOf('day').format('x');
      } else {
        query.from = params.from;
        query.to = params.to;
      }

      if (data.carriers) query.carriers = data.carriers;
      if (data.timescale) query.timescale = data.timescale;
      if (data.timeWindow) query.timeWindow = data.timeWindow;
      if (data.breakdown) query.breakdown = data.breakdown;
      if (data.status) query.status = data.status;
      if (data.countries) query.countries = data.countries;
      query = _.omit(query, value => !value);
      return query;
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

    logger.debug(`EndUser Statistic API Endpoint: ${reqUrl}?${qs.stringify(params)}`);

    try {
      const res = await request(endpoint.METHOD, reqUrl)
                        .query(params)
                        .buffer()
                        .timeout(this.opts.timeout);
      return res.body;
    } catch (err) {
      logger.debug(util.format('Received error response from %s: ', reqUrl));
      throw handleError(err, err.status || 400);
    }
  }

  async getUserStats(params) {
    const query = this.normalizeData(REQUEST_TYPE.USER, params);

    const res = await this.sendRequest(this.opts.endpoints.USER, query);
    return res;
  }

  async getNewUserStats(params) {
    const query = this.normalizeData(REQUEST_TYPE.NEW_USERS, params);

    const res = await this.sendRequest(this.opts.endpoints.NEW_USERS, query);
    return res;
  }

  async getActiveUserStats(params) {
    const query = this.normalizeData(REQUEST_TYPE.USER.ACTIVE_USERS, params);

    const res = await this.sendRequest(this.opts.endpoints.ACTIVE_USERS, query);
    return res;
  }
}
