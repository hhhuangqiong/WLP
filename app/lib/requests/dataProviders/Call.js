var _       = require('lodash');
var logger  = require('winston');
var nconf   = require('nconf');
var moment  = require('moment');
var Q       = require('q');
var request = require('superagent');
var util    = require('util');

import {constructOpts, formatDateString, swapDate, composeResponse, handleError} from '../helper';
import qs from 'qs';

export default class CallsRequest {

  constructor(baseUrl, timeout) {

    let opts = {
      type: 'dataProviderApi',
      baseUrl: baseUrl,
      timeout: timeout,
      methods: {
        CALLS: {
          URL: '/api/v1/sip/cdr/query',
          METHOD: 'GET'
        }
      }
    };

    this.opts = constructOpts(opts);
  }

  /**
   * @method formatQueryData Format and Normalize query string for Calls request
   *
   * @param params {Object} Query data received from a request
   * @param params.from {String} date string in format of MM/DD/YYYY (momnet().format('L'))
   * @param params.to {String} date string in format of MM/DD/YYYY (momnet().format('L'))
   * @param params.page {Int} page number
   * @param params.size {Int} total of entities in one page
   * @param params.username {String} mobile number of caller
   * @param cb {Function} Q callback
   */
  formatQueryData(params, cb) {
    Q.nfcall(swapDate, params)
      .then((params) => {
        var format = nconf.get(util.format('%s:format:timestamp', this.opts.type)) || 'x';
        return formatDateString(params, format)
      })
      .then(normalizeData)
      .fail((err) => {
        return cb(handleError(err, 500), null);
      })
      .done((params) => {
        return cb(null, params);
      });

    function normalizeData(params) {
      var query = {};

      query.from    = params.from;
      query.to      = params.to;
      query.page    = params.page || 0;
      query.size    = params.size || 20;

      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      if (params.caller_carrier)
        query.caller_carrier = params.caller_carrier;

      if (params.caller)
        query.caller = params.caller;

      if (params.callee)
        query.callee = params.callee;

      if (params.caller_country)
        query.caller_country = params.caller_country;

      if (params.type)
        query.type = params.type;

      return query;
    }
  }

  /**
   * @method sendRequest Send request with SuperAgent
   *
   * @param params {Object} Formatted query object
   * @param [loadBalanceIndex=0] {Number} the load balancing index which serves
   * as the index of the api endpoints array
   * @param cb {Function} Callback function from @method getCalls
   */
  sendRequest(params, loadBalanceIndex=0, cb) {
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

    let url = util.format('%s%s', baseUrl, this.opts.methods.CALLS.URL);

    logger.debug(`Calls: ${this.opts.methods.CALLS.METHOD} ${url}?${qs.stringify(params)}`, params);

    request
      .get(url)
      .query(params)
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) return cb(handleError(err, err.status || 400));
        this.filterCalls(res.body, cb);
      });
  }

  /**
   * @method filterCalls
   * this is to prevent from duplicated OFFNET records
   * the api return two types of OFFNET calls
   * which source are either `PROXY` or `GATEWAY`
   *
   * @param data {Object} result return from API request
   * @param cb {Function} Callback function from @method getCalls
   */
  filterCalls(data, cb) {
    if (data && data.content) {
      data.content = _.filter(data.content, function(call) {
        if (call.type.toLowerCase() === 'offnet') {
          return call.source == 'GATEWAY';
        } else {
          return call;
        }
      });
    }

    cb(null, composeResponse(data));
  }

  /**
   * @method getCalls
   *
   * @param params {Object} Raw query data object
   * @param cb {Function} Callback function from API controller
   */
  getCalls(params, cb) {
    logger.debug('get calls from carrier %s', params);

    Q.ninvoke(this, 'formatQueryData', params)
      .then((params) => {
        this.sendRequest(params, cb);
      })
      .catch((err) => {
        return cb(handleError(err, err.status || 500));
      });
  }
}
