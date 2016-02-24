import logger from 'winston';
import moment from 'moment';
import Q from 'q';
import request from 'superagent';
import util from 'util';
import qs from 'qs';

import { constructOpts, handleError } from '../helper';

const LONG_DATE_FORMAT = 'YYYY-MM-DDTHH:MM:ss[Z]';

export default class VSFTransactionRequest {
  constructor(baseUrl, timeout) {
    const opts = {
      baseUrl: baseUrl,
      timeout: timeout,
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
    const fromTime = moment(params.fromTime, 'L').startOf('day').toISOString();
    const toTime = moment(params.toTime, 'L').endOf('day').toISOString();

    // parse the date object and render it as predefined time string
    params.fromTime = moment.utc(fromTime).format(LONG_DATE_FORMAT);
    params.toTime = moment.utc(toTime).format(LONG_DATE_FORMAT);

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
        if (err) return cb(handleError(err, err.status || 400));
        if (res.status >= 400) return cb(handleError(res.body.error.message, res.body.error.httpStatus));
        cb(null, res.body);
      });
  }

  getTransactions(carrierId, params, cb) {
    Q.ninvoke(this, 'formatQueryData', params)
      .then(formattedParams => {
        this.sendRequest(carrierId, formattedParams, cb);
      }).catch((err) => {
        return handleError(err, 500);
      });
  }
}
