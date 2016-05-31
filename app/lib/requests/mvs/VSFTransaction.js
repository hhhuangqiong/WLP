import logger from 'winston';
import moment from 'moment';
import Q from 'q';
import request from 'superagent';
import util from 'util';
import qs from 'qs';

import { constructOpts, handleError } from '../helper';

export default class VSFTransactionRequest {
  constructor(baseUrl, timeout) {
    const opts = {
      baseUrl,
      timeout,
      methods: {
        LIST: {
          URL: '/1.0/transactions/carriers/%s',
          METHOD: 'GET',
        },
      },
    };

    this.opts = constructOpts(opts);
  }

  formatQueryData(params, cb) {
    // transform local L format date to UTC time with proper date range
    const fromTime = moment(params.fromTime, 'L').startOf('day');
    const toTime = moment(params.toTime, 'L').endOf('day');

    // parse the date object and render it as predefined time string
    params.fromTime = moment.utc(fromTime).toISOString();
    params.toTime = moment.utc(toTime).toISOString();

    return cb(null, params);
  }

  sendRequest(carrierId, params, cb) {
    const base = this.opts.baseUrl;
    const url = util.format(this.opts.methods.LIST.URL, carrierId);

    logger.info(`MVS API Endpoint: ${base}${url}?${qs.stringify(params)}`);

    request
      .get(util.format('%s%s', base, url))
      .query(params)
      .buffer()
      .timeout(this.timeout)
      .end((err, res) => {
        if (err) {
          cb(handleError(err, err.status || 400));
          return;
        }

        if (res.status >= 400) {
          cb(handleError(res.body.error.message, res.body.error.httpStatus));
          return;
        }

        cb(null, res.body);
      });
  }

  getTransactions(carrierId, params, cb) {
    Q
      .ninvoke(this, 'formatQueryData', params)
      .then(formattedParams => {
        this.sendRequest(carrierId, formattedParams, cb);
      }).catch(err => handleError(err, 500));
  }
}
