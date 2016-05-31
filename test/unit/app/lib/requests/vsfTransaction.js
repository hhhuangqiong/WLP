import { expect } from 'chai';
import nock from 'nock';
import moment from 'moment';
import util from 'util';
import Qs from 'qs';

// object under test
import MvsRequest from 'app/lib/requests/mvs/VSFTransaction';

describe('mvsRequest', function() {
  let request = null;
  let params  = {};
  let carrierId = 'yato.maaii.com';
  let baseUrl = 'http://192.168.118.13:9125';
  let url     = util.format('/transactions/carriers/%s', carrierId);
  let delay   = 20;
  let timeout = 100;

  describe('VSF Transaction Query', function() {

    beforeEach(function() {
      timeout = 100;
      request = new MvsRequest(baseUrl, timeout);
      params  = {
        fromTime: '12/30/2014',
        toTime: '6/29/2015',
        pageSize: 1000
      };

      let formattedParams = Qs.stringify({
        fromTime: moment(params.fromTime, 'L').startOf('day').format('MMMM Do YYYY, h:mm:ss a'),
        toTime: moment(params.toTime, 'L').endOf('day').format('MMMM Do YYYY, h:mm:ss a')
      });

      return nock(baseUrl)
        .get(util.format('%s?%s', url, formattedParams))
        .delay(delay)
        .reply(200, {
          "carrierId": carrierId,
          "recordsCount": 3,
          "dateRange":  {
            "fromTime": "2014-12-30T16:00:00Z",
            "toTime": "2014-12-31T16:00:00Z",
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
    });

    afterEach(() => request = null);

    it('should convert date query strings into ISO 8601 format', () =>
      request.formatQueryData(params, function(err, val) {
        let fromTime = moment(params.fromTime).startOf('day').toISOString();
        let toTime = moment(params.toTime).endOf('day').toISOString();

        expect(val.fromTime)
        .to.equal(moment.utc(fromTime).toISOString());
        return expect(val.toTime)
        .to.equal(moment.utc(toTime).toISOString());
      })
    );

    it.skip('should return a transaction record array in successful request', done =>
      request.getTransactions(carrierId, params, function(err, body) {
        expect(err)
        .to.not.exist;

        expect(body)
        .to.be.an('array');
        expect(body[0])
        .to.be.an('object')
        .that.have.all.keys([
          'userNumber',
          'purchaseDate',
          'virtualItemId',
          'store',
          'paymentType',
          'categories',
          'amount',
          'currency',
          'transactionId',
          'transactionStatus'
        ]);

        return done();
      })
    );

    it.skip('should not return error if timeout', function(done) {
      timeout = 10;
      request = new mvsRequest(baseUrl, timeout);

      return request.getTransactions(carrierId, params, function(err, val) {
        expect(err)
        .to.be.null;

        return done();
      });
    });
  });
});
