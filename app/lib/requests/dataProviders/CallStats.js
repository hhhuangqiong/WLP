import logger from 'winston';
import Q from 'q';
import request from 'superagent';
import util from 'util';
import _ from 'lodash';
import qs from 'qs';
import { constructOpts, swapDate, handleError } from '../helper';
import * as requestHelper from '../utils/requestHelper';
import equals from 'shallow-equals';

const REQUEST_TYPE = {
  CALLS: 'CALLS',
  CALLERS: 'CALLERS',
  CALLEES: 'CALLEES',
};

export default class UserStatsRequest {
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

  normalizeData(type, params, cb) {
    logger.debug('normalizeData', params);
    Q
      .nfcall(swapDate, params)
      .then(data => {
        const query = {};

        query.from = params.from;
        query.to = params.to;

        if (data.caller_carrier) query.caller_carrier = data.caller_carrier;
        if (data.timescale) query.timescale = data.timescale;
        if (data.timeWindow) query.timeWindow = data.timeWindow;
        if (data.breakdown) query.breakdown = data.breakdown;
        if (data.status) query.status = data.status;
        if (data.countries) query.countries = data.countries;
        if (data.stat_type) query.stat_type = data.stat_type;
        if (data.type) query.type = data.type;

        return _.omit(query, (value) => { return !value; });
      })
      .then(query => {
        cb(null, query);
      })
      .catch(err => {
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
    const baseUrlArray = baseUrl.split(',');

    if (baseUrlArray.length > 1) {
      const index = loadBalanceIndex % baseUrlArray.length;
      baseUrl = baseUrlArray[index];
    } else {
      baseUrl = _.first(baseUrlArray);
    }

    const reqUrl = util.format('%s%s', baseUrl, endpoint.PATH);

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
    Q
      .ninvoke(this, 'normalizeData', REQUEST_TYPE.CALLS, params)
      .then(query => Q.ninvoke(requestHelper, 'splitQuery', query))
      .then(queries => Q.allSettled(
        _.map(queries, (query, index) => Q.ninvoke(
          this,
          'sendRequest',
          this.opts.endpoints.CALLS,
          query,
          index
        ))
      ))
      .then(results => {
        const error = _.find(results, result => result.state !== 'fulfilled');

        if (error) {
          throw new Error('error occurred when querying data');
        }

        let output = [];

        // IMPORTANT:
        // DO NOT SUPPORT TIME SCALE OF HOUR FOR MORE THAN ONE DAY

        // do this only when the load balancing is used
        if (results.length > 1) {
          // get the max number of results as sample for the segment details
          // as the breakdown could be dynamic

          // IMPORTANT: when the api returns no data,
          // it no longer follows the breakdown,
          // but return all segment keys with value of 'all'
          // e.g. breakdown success should return two array of results
          // which has the value of 'false' and 'true' for key of 'success'
          // when it returns no data, the value of key of 'success' will become 'all'

          // so, you will have to get the max number of segment and
          // make it as a sample
          let resultSample = _.max(results, result => (_.get(result, 'value.results')).length);

          resultSample = _.get(resultSample, 'value.results');

          // init the data array with segment
          // assume that the returned results are always with the
          // same order of segment
          output = _.reduce(resultSample, (data, result) => {
            data.push({ segment: _.get(result, 'segment'), data: [] });
            return data;
          }, []);

          _.map(results, (result, resultIndex) => {
            const values = _.get(result, 'value.results');

            // looping over the sample rather than values
            // as the value structure varies
            _.map(resultSample, (sample, segmentIndex) => {
              const sampleSegment = _.get(sample, 'segment');

              // if an identical segment is found,
              // populate the data into the segment
              const value = _.find(values, value => equals(sampleSegment, _.get(value, 'segment')));

              if (!_.isEmpty(value) && !_.isUndefined(value)) {
                _.map(value.data, record => {
                  // the manually load balancing invades the correct t value,
                  // so it has to be overwritten here again with the resultIndex
                  output[segmentIndex].data.push(_.merge(record, { t: resultIndex }));
                });

              // if no identical segment is found,
              // populate an empty data set as it is unrecognisable
              } else {
                output[segmentIndex].data.push({ t: resultIndex, v: 0 });
              }
            });
          });
        } else {
          output = _.get(results, '0.value.results');
        }

        cb(null, output);
      })
      .catch(error => {
        logger.error(error);
        cb(handleError(error, error.status || 500));
      })
      .done();
  }

  getCallerStats(params, cb) {
    Q
      .ninvoke(this, 'normalizeData', REQUEST_TYPE.CALLERS, params)
      .then(query => Q.ninvoke(requestHelper, 'splitQuery', query))
      .then(queries => {
        return Q.allSettled(
          _.map(queries, (query, index) => {
            return Q.ninvoke(this, 'sendRequest', this.opts.endpoints.CALLERS, query, index);
          })
        );
      })
      .then(results => {
        const error = _.find(results, result => result.state !== 'fulfilled');

        if (error) {
          throw new Error('error occurred when querying data');
        }

        // get the first result as sample for the segment details
        // as the breakdown could be dynamic
        let resultSample = _.max(results, result => (_.get(result, 'value.results')).length);

        resultSample = _.get(resultSample, 'value.results');

        // init the data array with segment
        // assume that the returned results are always with the
        // same order of segment
        const output = _.reduce(resultSample, (data, result) => {
          data.push({ segment: _.get(result, 'segment'), data: [] });
          return data;
        }, []);

        // map the data into the data key in output
        _.map(results, result => {
          const values = _.get(result, 'value.results');
          _.map(values, (value, index) => {
            if (value && value.data) {
              _.map(value.data, record => {
                output[index]
                  .data
                  .push(record);
              });
            }
          });
        });

        cb(null, output);
      })
      .catch(error => {
        logger.error(error);
        cb(handleError(error, error.status || 500));
      })
      .done();
  }

  getCalleeStats(params, cb) {
    Q
      .ninvoke(this, 'normalizeData', REQUEST_TYPE.CALLEES, params)
      .then(query => Q.ninvoke(requestHelper, 'splitQuery', query))
      .then(queries => {
        return Q.allSettled(
          _.map(queries, (query, index) => {
            return Q.ninvoke(this, 'sendRequest', this.opts.endpoints.CALLEES, query, index);
          })
        );
      })
      .then(results => {
        const error = _.find(results, result => result.state !== 'fulfilled');

        if (error) {
          throw new Error('error occurred when querying data');
        }

        // get the first result as sample for the segment details
        // as the breakdown could be dynamic
        let resultSample = _.max(results, result => (_.get(result, 'value.results')).length);

        resultSample = _.get(resultSample, 'value.results');

        // init the data array with segment
        // assume that the returned results are always with the
        // same order of segment
        const output = _.reduce(resultSample, (data, result) => {
          data.push({ segment: _.get(result, 'segment'), data: [] });
          return data;
        }, []);

        // map the data into the data key in output
        _.map(results, result => {
          const values = _.get(result, 'value.results');

          _.map(values, (value, index) => {
            if (value && value.data) {
              _.map(value.data, record => {
                output[index]
                  .data
                  .push(record);
              });
            }
          });
        });

        cb(null, output);
      })
      .catch(error => {
        logger.error(error);
        cb(handleError(error, error.status || 500));
      })
      .done();
  }
}
