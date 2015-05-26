var _       = require('lodash');
var logger  = require('winston');
var moment  = require('moment');
var nconf   = require('nconf');
var Q       = require('q');
var request = require('superagent');
var util    = require('util');

import BaseRequest from '../Base';

export default class TopUpRequest extends BaseRequest {

  constructor(baseUrl, timeout) {

    let opts = {
      baseUrl: baseUrl,
      timeout: timeout,
      methods: {
        LIST: {
          URL: '/api/transactionHistory',
          METHOD: 'GET'
        }
      }
    };

    super(opts);
  }

  formatQueryData(params, cb) {
    logger.debug('formatting query data for transaction history');

    Q.fcall(swapDate)
      .then(formatDateString)
      .then(stringifyArray)
      .fail(function(err) {
        return cb(err);
      })
      .done(function(params) {
        return cb(null, params);
      });

    function formatDateString() {
      params.startDate = moment(params.startDate, "L").startOf("day").format("YYYYMMDDHHmmss");
      params.endDate   = moment(params.endDate, "L").endOf("day").format("YYYYMMDDHHmmss");
      return params;
    }

    function swapDate() {
      if (moment(params.startDate, "L").isAfter(moment(params.endDate, "L"))) {
        let tmp = params.endDate;
        params.endDate = params.startDate;
        params.startDate = tmp;
      }
      return params;
    }

    // originally for AngularJS multiple selections
    function stringifyArray() {
      for (var key in params) {
        if (params[key] instanceof Array) {
          params[key] = params[key].join(",");
        }
      }
      return params;
    }
  }

  sendRequest(params, cb) {
    logger.debug('sending transaction history request');

    var base = this.opts.baseUrl;
    var url = this.opts.methods.LIST.URL;

    request
      .get(util.format('%s%s', base, url))
      .query(params)
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        // Do we need to distinguish different Errors? Timeout and ENOTFOUND
        if (err) return cb(this.handleError(err, err.status || 400));
        if (res.error) return cb(this.handleError(res.body.error.description, res.error.code));
        return cb(null, res.body.result);
      });
  }

  getTopUp(params, cb) {
    logger.debug('get transaction history from BOSS with params', params);

    Q.ninvoke(this, 'formatQueryData', params)
      .then(this.appendRequestId)
      .then((params) => {
        this.sendRequest(params, cb);
      })
      .catch((err) => {
        return cb(this.handleError(err), 500);
      });
  }
}
