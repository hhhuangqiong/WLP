import logger from 'winston';
import Q from 'q';
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

  sendRequest(endpoint, params, loadBalanceIndex = 0, cb) {
    if (!cb && _.isFunction(loadBalanceIndex)) {
      cb = loadBalanceIndex;
      loadBalanceIndex = 0;
    }

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

    request(endpoint.METHOD, reqUrl)
      .query(params)
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) {
          // @TODO since timeout won't have res and prevent exception from undefeined res.body
          logger.debug('Received error', err);
          if (res) {
            logger.debug(util.format('Received error response from %s: ', reqUrl), jsonSchema(res.body));
          }
          cb(err);
          return;
        }

        cb(null, res.body);
      });
  }

  getUserStats(params, cb) {
    const query = this.normalizeData(REQUEST_TYPE.USER, params);
    try {
      this.sendRequest(this.opts.endpoints.USER, query, cb);
    } catch (err) {
      cb(handleError(err, err.status || 500));
    }
  }

  getNewUserStats(params, cb) {
    const query = this.normalizeData(REQUEST_TYPE.NEW_USERS, params);
    try {
      this.sendRequest(this.opts.endpoints.NEW_USERS, query, cb);
    } catch (err) {
      cb(handleError(err, err.status || 500));
    }
  }

  getActiveUserStats(params, cb) {
    const query = this.normalizeData(REQUEST_TYPE.USER.ACTIVE_USERS, params);
    try {
      this.sendRequest(this.opts.endpoints.ACTIVE_USERS, query, cb);
    } catch (err) {
      cb(handleError(err, err.status || 500));
    }
  }
}
