var logger  = require('winston');
var Q       = require('q');
var request = require('superagent');
var util    = require('util');

import BaseRequest from '../Base';

export default class WalletRequest extends BaseRequest {

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

    super(opts);
  }

  validateQuery(params, cb) {
    logger.debug('validate user wallet request query, %j', params, {});

    if (!params.number || !params.carrier || !params.sessionUserName)
      return cb(new Error('missing mandatory fields.'), null);

    return cb(null, params);
  }

  sendRequest(params, cb) {
    logger.debug('sending user wallet request');

    var base = this.opts.baseUrl;
    var url = this.opts.methods.LIST.URL;

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
          return cb(null, null);
        }

        var result = res.body || undefined;
        if (!result) logger.debug('failed to get response form BOSS');

        return cb(null, result.result.wallets);
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
      .then(this.appendRequestId)
      .then((params)=> {
        this.sendRequest(params, cb);
      })
      .catch((err)=> {
        logger.error(err);
        this.rejectRequest(err, cb);
      });
  }
}
