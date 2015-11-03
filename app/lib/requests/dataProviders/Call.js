var _       = require('lodash');
var logger  = require('winston');
var nconf   = require('nconf');
var moment  = require('moment');
var Q       = require('q');
var request = require('superagent');
var util    = require('util');

import BaseRequest from '../Base';
import qs from 'qs';

export default class CallsRequest extends BaseRequest {

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

    super(opts);
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
    Q.ninvoke(this, 'swapDate', params)
      .then((params) => {
        var format = nconf.get(util.format('%s:format:timestamp', this.opts.type)) || 'x';
        return this.formatDateString(params, format)
      })
      .then(normalizeData)
      .fail((err) => {
        return cb(this.handleError(err, 500), null);
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
   * @param cb {Function} Callback function from @method getCalls
   */
  sendRequest(params, cb) {
    var url = this.opts.baseUrl + this.opts.methods.CALLS.URL;

    logger.debug(`Calls: ${this.opts.methods.CALLS.METHOD} ${url}?${qs.stringify(params)}`, params);

    request
      .get(url)
      .query(params)
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) return cb(this.handleError(err, err.status || 400));
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

    cb(null, this.composeResponse(data));
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
        return cb(this.handleError(err, err.status || 500));
      });
  }
}
