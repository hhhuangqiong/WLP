var logger  = require('winston');
var nconf   = require('nconf');
var nock    = require('nock');
var moment  = require('moment');
var Q       = require('q');
var request = require('superagent');
var util    = require('util');

import BaseRequest from '../Base';

export default class CallsRequest extends BaseRequest {

  constructor(baseUrl, timeout) {

    let opts = {
      type: 'dataProviderApi',
      baseUrl: baseUrl,
      timeout: timeout,
      methods: {
        CALLS: {
          URL: '/sip/cdr/query',
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

      query.carrier = params.carrierId;
      query.from    = params.from;
      query.to      = params.to;
      query.page    = params.pageNumber || 0;
      query.size    = params.size || 20;

      if (params.username)
        query.caller = params.username;

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
    var base = this.opts.baseUrl;
    var url = this.opts.methods.CALLS.URL;

    request
      .get(util.format('%s%s', base, url))
      .query(params)
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) return cb(this.handleError(err, err.status || 400));
        //if (res.status >= 400) return cb(this.handleError(res.body.error.message, res.body.error.httpStatus));
        cb(null, this.composeResponse(res.body));
      });
  }

  /**
   * @method getCalls
   *
   * @param params {Object} Raw query data object
   * @param cb {Function} Callback function from API controller
   */
  getCalls(params, cb) {
    logger.debug('get calls from carrier %s', params.carrierId);

    Q.ninvoke(this, 'formatQueryData', params)
      .then((params) => {
        this.sendRequest(params, cb);
      })
      .catch((err) => {
        return cb(this.handleError(err, err.status || 500));
      });
  }
}
