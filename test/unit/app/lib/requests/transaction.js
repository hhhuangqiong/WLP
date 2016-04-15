import { expect } from 'chai';
import nock from 'nock';
import util from 'util';

// object under test
import TransactionRequest from 'app/lib/requests/boss/TopUp';

describe.skip('TransactionRequest', function() {
  let request = null;
  let params  = {};
  let baseUrl = 'http://this.is.boss';
  let url     = '/api/transactionHistory';
  let delay   = 20;

  describe('TransactionQuery', function() {

    beforeEach(function() {
      let timeout = 100;
      request = new TransactionRequest(baseUrl, timeout);
      params  = {
        requestId: '3ab4cd',
        startDate: '02/24/2015',
        endDate: '02/24/2015',
        rechargeType: ['promotional', 'CreditCard'],
        status: ['failure', 'pending']
      };

      return nock(baseUrl)
        .get(util.format('%s?requestId=%s&startDate=20150224000000&endDate=20150224235959', url, params.requestId))
        .delay(delay)
        .reply(200, {
          "id": params.requestId,
          "success": true,
          "result": {
            "totalRec":"1",
            "history": [
              {
              "orderNo":"14112575091339",
              "transactionNo": "1Y1965053S7780043",
              "rechargeDate":"2004-11-25T12:41:06.000+08:00",
              "username":"+85259111131@maaii.com",
              "walletType":"Paid",
              "amount":2.0,
              "currency":840,
              "rechargeType":"Paypal",
              "status": "Success",
              "cardType": "Visa",
              "cardNo": "439225******8447",
              "description":"",
              "errorDescription":""
              }
            ]
          }
        });
    });

    afterEach(() => request = null);

    it('should swap startDate with endDate if startDate is later than endDate', function() {
      params = {
        startDate: '02/02/2015',
        endDate: '02/01/2015'
      };
      return request.formatQueryData(params, (err, formatted) =>
        expect(formatted.startDate < formatted.endDate)
        .to.be.true
      );
    });

    it('should convert date into format YYYYMMDDhhmmss', () =>
      request.formatQueryData(params, (err, formatted) =>
        expect(formatted.startDate, formatted.endDate)
        .to.be.a('string')
        .and.to.have.length(14)
      )
    );

    it('should convert arrays into strings', () =>
      request.formatQueryData(params, function(err, formatted) {
        expect(formatted.rechargeType)
        .to.be.a('string');
        return expect(formatted.status)
        .to.be.a('string');
      })
    );

    it('should return error if timeout', function(done) {
      let timeout = 10;
      request = new TransactionRequest(baseUrl, timeout);
      params  = {
        requestId: params.requestId,
        startDate: '02/24/2015',
        endDate: '02/24/2015'
      };
      return request.getTopUp(params, function(err, val) {
        expect(err).to.have.property('timeout', timeout);

        return done();
      });
    });

    it('should return an array of history objects in successful request', function(done) {
      params = {
        requestId: params.requestId,
        startDate: '02/24/2015',
        endDate: '02/24/2015'
      };
      return request.getTopUp(params, function(err, body) {
        expect(body)
        .to.be.an('object')
        .that.has.all.keys([
          'totalRec',
          'history',
          'page'
        ]);

        expect(body['history'][0])
        .to.be.an('object')
        .that.have.all.keys([
          'orderNo',
          'transactionNo',
          'rechargeDate',
          'username',
          'walletType',
          'amount',
          'currency',
          'rechargeType',
          'status',
          'cardType',
          'cardNo',
          'description',
          'errorDescription'
        ]);

        return done();
      });
    });
  });
});
