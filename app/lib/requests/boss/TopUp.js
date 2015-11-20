var _       = require('lodash');
var logger  = require('winston');
var moment  = require('moment');
var nconf   = require('nconf');
var Q       = require('q');
var request = require('superagent');
var util    = require('util');
var qs      = require('qs');

import {contructOpts, appendRequestId, handleError} from '../helper';

export default class TopUpRequest {

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

    this.opts = contructOpts(opts);
  }

  formatQueryData(params, cb) {
    logger.debug('formatting query data for transaction history');

    Q.fcall(swapDate)
      .then(formatDateString)
      .fail(function(err) {
        return cb(err);
      })
      .done(function(params) {
        return cb(null, params);
      });

    function formatDateString() {
      params.startDate = moment(params.startDate, 'L').startOf('day').format('YYYYMMDDHHmmss');
      params.endDate   = moment(params.endDate, 'L').endOf('day').format('YYYYMMDDHHmmss');
      return params;
    }

    function swapDate() {
      if (moment(params.startDate, 'L').isAfter(moment(params.endDate, 'L'))) {
        let tmp = params.endDate;
        params.endDate = params.startDate;
        params.startDate = tmp;
      }

      return params;
    }
  }

  sendRequest(params, cb) {

    var base = this.opts.baseUrl;
    var url = this.opts.methods.LIST.URL;
    var fullUrl = util.format('%s%s', base, url);

    logger.debug('sending transaction history request %s?%s', fullUrl, qs.stringify(params));

    request
      .get(fullUrl)
      .query(params)
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        // Do we need to distinguish different Errors? Timeout and ENOTFOUND
        if (err) return cb(handleError(err, err.status || 400));

        try {
          if (res.error) return cb(handleError(res.body.error.description, res.error.code));

          // bossApi does not return page number,
          // in order to keep page state in Top Up Store
          _.assign(res.body.result, { page: params.page });

          return cb(null, res.body.result);
        }
        catch(e) {
          // unexpected response
          logger.debug('Unexpected response from BOSS transactionHistor: ', fullUrl, params);
          logger.debug('Parsing error stack:', e.stack);
          err = new Error();
          err.message = 'Unexpected response';
          err.status = 500;
          return cb(err);
        }
      });
  }

  getTopUp(params, cb) {
    logger.debug('get transaction history from BOSS with params', params);

    Q.ninvoke(this, 'formatQueryData', params)
      .then(appendRequestId)
      .then((params) => {
        this.sendRequest(params, cb);
      })
      .catch((err) => {
        return cb(handleError(err), 500);
      });
  }
}
