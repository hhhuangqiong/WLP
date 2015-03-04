var logger  = require('winston');
var nock    = require('nock');
var Q       = require('q');
var request = require('superagent');
var util    = require('util');

import BaseRequest from '../Base';

export default class VSFTransactionRequest extends BaseRequest {

  constructor(baseUrl, timeout) {

    let opts = {
      baseUrl: baseUrl,
      timeout: timeout,
      methods: {
        LIST: {
          URL: '/transactions/carriers/%s',
          METHOD: 'GET'
        }
      }
    };

    super(opts);
  }

  getTransactions(carrierId, cb) {
    var base = this.opts.baseUrl;
    var url = util.format(this.opts.methods.LIST.URL, carrierId);

    nock(base)
      .get(url)
      .delay(2000)
      .reply(200, {
        "carrierId": "testcarrier.com",
          "recordsCount": 3,
          "dateRange":  {
            "fromTime": "2014-12-31T16:00:00Z",
            "toTime": "2015-02-28T16:00:00Z",
            "pageNumberIndex": 0
          },
          "criteria": [
            "paymentType=Paid",
            "category=sticker"
          ],
          "transactionRecords": [
            {
              "userNumber": "+85291111111",
              "purchaseDate": "2014-12-31T17:00:00Z",
              "virtualItemId": "store.item.1",
              "store": "Apple",
              "paymentType": "Paid",
              "categories": [ "sticker", "featured" ],
              "amount": 1.0,
              "currency": "USD",
              "transactionId": "XX0XX0XXX0",
              "transactionStatus": "Consumed"
            },
            {
              "userNumber": "+85291111112",
              "purchaseDate": "2015-01-01T18:00:00Z",
              "virtualItemId": "store.item.2",
              "store": "Google",
              "paymentType": "Paid",
              "categories": [ "sticker" ],
              "amount": 2.5,
              "currency": "USD",
              "transactionId": " 0.G.123456789012345",
              "transactionStatus": "Consumed"
            },
            {
              "userNumber": "+85291111113",
              "purchaseDate": "2015-02-01T23:00:00Z",
              "virtualItemId": "store.item.3",
              "store": "Apple",
              "paymentType": "Paid",
              "categories": [ "sticker" ],
              "amount": 3.0,
              "currency": "USD",
              "transactionId": "XX0XX0X0X0",
              "transactionStatus": "Failed"
            }
          ]
      });

    request
      .get(util.format('%s%s', base, url))
      //.query(params)
      .buffer()
      .timeout(this.timeout)
      .end((err, res) => {
        if (err) return cb(err);
        if (res.status >= 400) return cb(this.handleError(res.body.err));
        cb(null, res.body);
      });

    logger.debug('get VSFTransaction from carrier %s', carrierId);
  }
}
