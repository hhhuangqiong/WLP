import logger from 'winston';
import Q from 'q';
import request from 'superagent';
import util from 'util';
import qs from 'qs';

import {constructOpts, appendRequestId} from '../helper';

export default class WalletRequest {

  constructor(baseUrl, timeout) {

    let opts = {
      baseUrl: baseUrl,
      timeout: timeout,
      methods: {
        LIST: {
          URL: '/api/walletBalance',
          METHOD: 'GET'
        }
      }
    };

    this.opts = constructOpts(opts);
  }

  validateQuery(params, cb) {
    logger.debug('validate user wallet request query, %j', params, {});

    if (!params.number || !params.carrier || !params.sessionUserName)
      return cb(new Error('missing mandatory fields.'), null);

    return cb(null, params);
  }

  sendRequest(params, cb) {

    var base = this.opts.baseUrl;
    var url = this.opts.methods.LIST.URL;

    logger.debug('sending user wallet request %s?%s', util.format('%s%s', base, url), qs.stringify(params));

    request
      .get(util.format('%s%s', base, url))
      .query(params)
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        // missing Wallet info is not critical?
        // Do not throw error if Wallet info is missing
        if (err) {
          logger.debug('failed to get user %s\'s wallet info from BOSS', params.number);

          // TODO: generalize the network error handling (maybe extending Error class?)
          let error = new Error();
          error.status = err.status;
          error.message = err.message;

          if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
            error.status = 504;
            error.timeout = this.opts.timeout;
          } else if (err.code === 'ENOTFOUND') {
            error.status = 404;
          } else if (err.code === 'ECONNREFUSED') {
            error.status = 500;
          }

          return cb(error);
        }

        let response = res.body;

        try {
          // no response
          if (!response) {
            logger.debug('No response returned form BOSS for user %s', params.number);
            err = new Error();
            err.message = 'No response returned';
            err.status = 500;
            return cb(err);
          }

          // failure response
          if (!response.success) {
            logger.debug('Failure response from BOSS for user %s', params.number, response);
            let responseError = response.error;
            err = new Error();
            err.message = responseError.description;
            err.code = responseError.code;
            err.status = 400;
            return cb(err);
          }

          return cb(null, response.result.wallets);
        }
        catch(e) {
          // unexpected response
          logger.debug('Unexpected response from BOSS for user %s', params.number, response);
          logger.debug('Error stack:', e.stack);
          err = new Error();
          err.message = 'Unexpected response';
          err.status = 500;
          return cb(err);
        }
      });
  }

  /*
   * DO NOT callback error but return null for Wallet Data
   * or it will terminate the Q.chain
   */
  rejectRequest(err, cb) {
    return cb(null, null);
  }

  getWalletBalance(params, cb) {
    logger.debug('get user %s\'s wallet info from BOSS', params.number);

    Q.ninvoke(this, 'validateQuery', params)
      .then(appendRequestId)
      .then((params) => {
        return this.sendRequest(params, cb);
      });
  }
}
