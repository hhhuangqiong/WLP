import { expect } from 'chai';
import nock from 'nock';
import util from 'util';

// object under test
import WalletRequest from 'app/lib/requests/boss/Wallet';

describe('WalletRequest', function() {
  let request = null;
  let params  = {};
  let baseUrl = 'http://this.is.mums';
  let url     = '/api/walletBalance';
  let delay   = 20;
  let timeout = 100;

  describe('WalletQuery', function() {

    beforeEach(function() {
      timeout = 100;
      request = new WalletRequest(baseUrl, timeout);
      params  = {
        requestId: '3ab4cd',
        carrier: 'yato.maaii.com',
        number: '91234567',
        sessionUserName: 'Tester',
      };

      return nock(baseUrl)
        .get(util.format('%s?requestId=%s&carrier=%s&number=%s&sessionUserName=%s', url, params.requestId,
          params.carrier, params.number, params.sessionUserName))
        .delay(delay)
        .reply(200, {
          "id": params.requestId,
          "success": true,
          "result": {
            "wallets": [
              {
                "id":12,
                "currency":840,
                "balance":20.0,
                "expiryDate":"yyyymmddhh24miss",
                "serviceType":"SMS",
                "walletType":"Free",
                "lastTopupDate":"yyyymmddhh24miss",
                "ocsStatus":"Active"
              },
              {
                "id":13,
                "currency":840,
                "balance":20.0,
                "expiryDate":"yyyymmddhh24miss",
                "serviceType":"Voice",
                "walletType":"Paid",
                "lastTopupDate":"yyyymmddhh24miss",
                "ocsStatus":"Deactivated"
              }
            ]
          }
        });
    });

    afterEach(() => request = null);

    it('should not throw error without mandatory parameters', function() {
      let fn;
      params = {};

      return fn = request.validateQuery(params, (err, formatted) => expect(err).to.not.be.undefined);
    });

    it.skip('should not return error if timeout', function(done) {
      timeout = 10;
      request = new WalletRequest(baseUrl, timeout);
      params  = {
        requestId: '3ab4cd',
        carrier: 'yato.maaii.com',
        number: '91234567',
        sessionUserName: 'Tester',
      };
      return request.getWalletBalance(params, function(err, val) {
        expect(err)
        .to.be.null;

        return done();
      });
    });

    it('should return a wallet array in successful request', done =>
      request.getWalletBalance(params, function(err, body) {
        expect(body)
        .to.be.an('array');
        expect(body[0])
        .to.be.an('object')
        .that.have.all.keys([
          'id',
          'currency',
          'balance',
          'expiryDate',
          'serviceType',
          'walletType',
          'lastTopupDate',
          'ocsStatus'
        ]);

        return done();
      })
    );
  });
});
