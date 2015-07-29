var logger  = require('winston');
var moment  = require('moment');
var Q       = require('q');
var request = require('superagent');
var util    = require('util');

import BaseRequest from '../Base';

const LONG_DATE_FORMAT = 'YYYY-MM-DDTHH:MM:ss[Z]';

export default class VSFTransactionRequest extends BaseRequest {
  constructor(baseUrl, timeout) {
    let opts = {
      baseUrl: baseUrl,
      timeout: timeout,
      methods: {
        LIST: {
          URL: '/1.0/transactions/carriers/%s',
          METHOD: 'GET'
        }
      }
    };

    super(opts);
  }

  formatQueryData(params, cb) {
    params.fromTime = moment(params.fromTime, 'L').startOf('day').format(LONG_DATE_FORMAT);
    params.toTime   = moment(params.toTime, 'L').endOf('day').format(LONG_DATE_FORMAT);

    return cb(null, params);
  }

  sendRequest(carrierId, params, cb) {
    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.LIST.URL, carrierId);

    request
      .get(util.format('%s%s', base, url))
      .query(params)
      .buffer()
      .timeout(this.timeout)
      .end((err, res) => {
        if (err) return cb(this.handleError(err, err.status || 400));
        if (res.status >= 400) return cb(this.handleError(res.body.error.message, res.body.error.httpStatus));
        cb(null, res.body.transactionRecords);
      });
  }

  getTransactions(carrierId, params, cb) {

    Q.ninvoke(this, 'formatQueryData', params)
      .then((params) => {
        this.sendRequest(carrierId, params, cb);
      }).catch((err) => {
        return this.handleError(err, 500);
      })
  }
}
