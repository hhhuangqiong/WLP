import logger from 'winston';
import Q from 'q';
import request from 'superagent';
import util from 'util';
import _ from 'lodash';
import moment from 'moment';
import CountryData from 'country-data';
import qs from 'qs';
import {constructOpts, formatDateString, swapDate, handleError} from '../helper';
import jsonSchema from '../../../utils/getSimplifiedJsonSchema.js';

const TIMESCALE_OPTS = ['day', 'hour'];
const BREAKDOWN_OPTS = ['country', 'status'];
const STATUS_OPTS = ['ACTIVE', 'TERMINATED', 'ALL'];
const COUNTRIES_OPTS = CountryData.all;

export default class UserStatsRequest {
  constructor(baseUrl, timeout) {
    let opts = {
      type: 'dataProviderApi',
      baseUrl: baseUrl,
      timeout: timeout,
      endpoints: {
        USER: {
          PATH: '/stats/1.0/user/query',
          METHOD: 'GET'
        },
        NEW_USERS: {
          PATH: '/stats/1.0/user/new_users',
          METHOD: 'GET'
        },
        ACTIVE_USERS: {
          PATH: '/stats/1.0/active_users/im-active-users-statistics',
          METHOD: 'GET'
        },
      }
    };

    this.opts = constructOpts(opts);
  }

  normalizeData(params, cb) {
    logger.debug('normalizeData', params);
    Q.nfcall(swapDate, params)
      .then((data) => {
        let query = {};
        query.from      = params.from;
        query.to        = params.to;

        if (data.carriers)    query.carriers = data.carriers;
        if (data.timescale)   query.timescale = data.timescale;
        if (data.timeWindow)  query.timeWindow = data.timeWindow;
        if (data.breakdown)   query.breakdown = data.breakdown;
        if (data.status)      query.status    = data.status;
        if (data.countries)   query.countries = data.countries;

        return _.omit(query, (value) => { return !value; });
      })
      .then((query) => {
        cb(null, query);
      })
      .catch((err) => {
        cb(handleError(err, 500), null);
      })
      .done();
  }

  sendRequest(endpoint, params, cb) {
    let reqUrl = util.format('%s%s', this.opts.baseUrl, endpoint.PATH);

    logger.debug(`EndUser Statistic API Endpoint: ${reqUrl}?${qs.stringify(params)}`);

    request(endpoint.METHOD, reqUrl)
      .query(params)
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) {
          logger.debug(util.format('Received a response from %s: ', reqUrl), jsonSchema(res.body));
          cb(err);
          return;
        }

        return cb(null, res.body);
      });
  }

  getUserStats(params, cb) {
    Q.ninvoke(this, 'normalizeData', params)
      .then((query) => {
        this.sendRequest(this.opts.endpoints.USER, query, cb);
      })
      .catch((error) => {
        cb(handleError(error, error.status || 500));
      })
      .done();
  }

  getNewUserStats(params, cb) {
    Q.ninvoke(this, 'normalizeData', params)
      .then((query) => {
        this.sendRequest(this.opts.endpoints.NEW_USERS, query, cb);
      })
      .catch((error) => {
        cb(handleError(error, error.status || 500));
      })
      .done();
  }

  getActiveUserStats(params, cb) {
    Q.ninvoke(this, 'normalizeData', params)
      .then((query) => {
        this.sendRequest(this.opts.endpoints.ACTIVE_USERS, query, cb);
      })
      .catch((error) => {
        cb(handleError(error, error.status || 500));
      })
      .done();
  }
}
