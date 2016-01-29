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
import * as requestHelper from '../utils/requestHelper';

const REQUEST_TYPE = {
  CALLS: 'CALLS',
  CALLERS: 'CALLERS',
  CALLEES: 'CALLEES'
};

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
        CALLERS: {
          PATH: '/stats/1.0/sip/callers',
          METHOD: 'GET'
        },
        CALLEES: {
          PATH: '/stats/1.0/sip/callees',
          METHOD: 'GET'
        },
        CALLS: {
          PATH: '/stats/1.0/sip/query',
          METHOD: 'GET'
        }
      }
    };

    this.opts = constructOpts(opts);
  }

  normalizeData(type, params, cb) {
    logger.debug('normalizeData', params);
    Q.nfcall(swapDate, params)
      .then((data) => {
        let query = {};

        query.from = params.from;
        query.to = params.to;

        if (data.caller_carrier)  query.caller_carrier = data.caller_carrier;
        if (data.timescale)   query.timescale = data.timescale;
        if (data.timeWindow)  query.timeWindow = data.timeWindow;
        if (data.breakdown)   query.breakdown = data.breakdown;
        if (data.status)      query.status    = data.status;
        if (data.countries)   query.countries = data.countries;
        if (data.stat_type)   query.stat_type = data.stat_type;
        if (data.type)        query.type      = data.type;

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

  sendRequest(endpoint, params, loadBalanceIndex = 0, cb) {
    if (!cb && _.isFunction(loadBalanceIndex)) {
      cb = loadBalanceIndex;
      loadBalanceIndex = 0;
    }

    let baseUrl = this.opts.baseUrl;
    let baseUrlArray = baseUrl.split(',');

    if (baseUrlArray.length > 1) {
      let index = loadBalanceIndex % baseUrlArray.length;
      baseUrl = baseUrlArray[index];
    } else {
      baseUrl = _.first(baseUrlArray);
    }

    let reqUrl = util.format('%s%s', baseUrl, endpoint.PATH);

    logger.debug(`SIP Statistic API Endpoint: ${reqUrl}?${qs.stringify(params)}`);

    request(endpoint.METHOD, reqUrl)
      .query(params)
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) {
          cb(handleError(err, err.status || 400));
          return;
        }
        cb(null, _.get(res, 'body'));
      });
  }

  getCallStats(params, cb) {
    Q.ninvoke(this, 'normalizeData', REQUEST_TYPE.CALLS, params)
      .then((query) => {
        return Q.ninvoke(requestHelper, 'splitQuery', query);
      })
      .then((queries) => {
        return Q.allSettled(
          _.map(queries, (query, index) => {
            return Q.ninvoke(this, 'sendRequest', this.opts.endpoints.CALLS, query, index);
          })
        );
      })
      .then((results) => {
        let error = _.find(results, (result) => {
          return result.state !== 'fulfilled';
        });

        if (error) {
          throw new Error('error occurred when querying data');
        }

        // get the first result as sample for the segment details
        // as the breakdown could be dynamic
        let resultSample = _.get(results, '0.value.results');

        // init the data array with segment
        // assume that the returned results are always with the
        // same order of segment
        let output = _.reduce(resultSample, (data, result) => {
          data.push({ segment: _.get(result, 'segment'), data: [] });
          return data;
        }, []);

        // map the data into the data key in output
        _.map(results, (result) => {
          let values = _.get(result, 'value.results');
          _.map(values, (value, index) => {
            _.map(value.data, (record) => {
              output[index].data.push(record);
            });
          });
        });

        cb(null, output);
      })
      .catch((error) => {
        logger.error(error);
        cb(handleError(error, error.status || 500));
      })
      .done();
  }

  getCallerStats(params, cb) {
    Q.ninvoke(this, 'normalizeData', REQUEST_TYPE.CALLERS, params)
      .then((query) => {
        return Q.ninvoke(requestHelper, 'splitQuery', query);
      })
      .then((queries) => {
        return Q.allSettled(
          _.map(queries, (query, index) => {
            return Q.ninvoke(this, 'sendRequest', this.opts.endpoints.CALLERS, query, index);
          })
        );
      })
      .then((results) => {
        let error = _.find(results, (result) => {
          return result.state !== 'fulfilled';
        });

        if (error) {
          throw new Error('error occurred when querying data');
        }

        // get the first result as sample for the segment details
        // as the breakdown could be dynamic
        let resultSample = _.get(results, '0.value.results');

        // init the data array with segment
        // assume that the returned results are always with the
        // same order of segment
        let output = _.reduce(resultSample, (data, result) => {
          data.push({ segment: _.get(result, 'segment'), data: [] });
          return data;
        }, []);

        // map the data into the data key in output
        _.map(results, (result) => {
          let values = _.get(result, 'value.results');
          _.map(values, (value, index) => {
            _.map(value.data, (record) => {
              output[index].data.push(record);
            });
          });
        });

        cb(null, output);
      })
      .catch((error) => {
        logger.error(error);
        cb(handleError(error, error.status || 500));
      })
      .done();
  }

  getCalleeStats(params, cb) {
    Q.ninvoke(this, 'normalizeData', REQUEST_TYPE.CALLEES, params)
      .then((query) => {
        return Q.ninvoke(requestHelper, 'splitQuery', query);
      })
      .then((queries) => {
        return Q.allSettled(
          _.map(queries, (query, index) => {
            return Q.ninvoke(this, 'sendRequest', this.opts.endpoints.CALLEES, query, index);
          })
        );
      })
      .then((results) => {
        let error = _.find(results, (result) => {
          return result.state !== 'fulfilled';
        });

        if (error) {
          throw new Error('error occurred when querying data');
        }

        // get the first result as sample for the segment details
        // as the breakdown could be dynamic
        let resultSample = _.get(results, '0.value.results');

        // init the data array with segment
        // assume that the returned results are always with the
        // same order of segment
        let output = _.reduce(resultSample, (data, result) => {
          data.push({ segment: _.get(result, 'segment'), data: [] });
          return data;
        }, []);

        // map the data into the data key in output
        _.map(results, (result) => {
          let values = _.get(result, 'value.results');
          _.map(values, (value, index) => {
            _.map(value.data, (record) => {
              output[index].data.push(record);
            });
          });
        });

        cb(null, output);
      })
      .catch((error) => {
        logger.error(error);
        cb(handleError(error, error.status || 500));
      })
      .done();
  }
}
