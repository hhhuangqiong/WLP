var logger  = require('winston');
var nock    = require('nock');
var Q       = require('q');
var request = require('superagent');
var util    = require('util');

import BaseRequest from '../Base';

export default class TransactionsRequest extends BaseRequest {

  constructor(baseUrl, timeout) {

    let opts = {
      baseUrl: baseUrl,
      timeout: timeout,
      methods: {
        LIST: {
          URL: '/walletBalance',
          METHOD: 'GET'
        }
      }
    };

    super(opts);
  }

  getWalletBalance(params, cb) {
    var base = this.opts.baseUrl;
    var url = this.opts.methods.LIST.URL;
    var requestId = this.createRequestId();

    if (!params.number || !params.carrier || !params.sessionUserName)
      throw new Error('missing mandatory fields.');

    nock(base)
      //.get(util.format('%s?carrier=%s&number=%s&sessionUserName=%s', url, number, carrier, sessionUserName))
      .get(url)
      .delay(1000)
      .reply(200, {
        "id": `${requestId}`,
        "success": true,
        "result": {
          "wallets": [{
            "id": 12,
            "currency": 840,
            "balance": 20.0,
            "expiryDate": "yyyymmddhh24miss",
            "serviceType": "SMS",
            "walletType": "Free",
            "lastTopupDate": "yyyymmddhh24miss",
            "ocsStatus": "Active"
          }]
        }
      });

    request
      .get(util.format('%s%s', base, url))
      .query(params)
      .buffer()
      .timeout(this.timeout)
      .end((err, res) => {
        // missing Wallet info is not critical?
        // Do not throw error if Wallet info is missing
        if (err) logger.debug('failed to get user %s\'s wallet info from BOSS', params.number);
        if (err || res.status >= 400) return cb(null, null);
        cb(null, res.body);
      });

    logger.debug('get user %s\'s wallet info from BOSS', params.number);
  }
}
