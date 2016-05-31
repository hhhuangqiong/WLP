import _ from 'lodash';
import logger from 'winston';
import moment from 'moment';
import Q from 'q';
import request from 'superagent';
import util from 'util';
import qs from 'qs';
import { OutOfMemoryError } from 'common-errors';

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
          let error = new Error('internal server error');

          const apiError = _.get(err, 'response.body.error');

          if (apiError && apiError.code === 30000) {
            // eslint-disable-next-line max-len
            error = new OutOfMemoryError('Maximum memory size exceeded. Please try again with smaller time range', apiError);
          }

          // eslint-disable-next-line max-len
          logger.error('error occurred when fetching MVS data', _.get(apiError, 'message')) || _.get(error, 'message');
          cb(handleError(error, error.status || 500));
          return;
        }

        if (res.status >= 400) {
          cb(handleError(_.get(res, 'body.error.message'), _.get(res, 'body.error.status')));
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
