import { expect } from 'chai';
import nock from 'nock';
import Qs from 'qs';
import util from 'util';

// object under test
import CallRequest from 'app/lib/requests/dataProviders/Call';
import callResponse from './responses/call.json';

describe('CallRequest', function() {
  let request = null;
  let params  = {};
  //baseUrl = 'http://this.is.dataprovider.com/api/v1'
  let baseUrl = 'http://this.is.dataprovider.com';
  let url     = '/api/v1/sip/cdr/query';
  let delay   = 20;
  let timeout = 100;

  describe('CallQuery', function() {

    beforeEach(function(done){
      timeout = 100;
      request = new CallRequest(baseUrl, timeout);
      params  = {
        caller_carrier: 'maaiitest.com',
        from: '1432185335',
        to: '1430185335',
        page: 0,
        size: 20
      };

      return request.formatQueryData(params, function(err, formatted) {
        let formattedParams = Qs.stringify(formatted);
        nock(baseUrl)
        .get(util.format('%s?%s', url, formattedParams))
        .delay(delay)
        .reply(200, callResponse);
        return done();
      });
    });

    afterEach(() => request = null);

    it('should swap startDate with endDate if startDate is later than endDate', function(done){
      params = {
        caller_carrier: 'maaiitest.com',
        from: '02/02/2015',
        to: '02/01/2015'
      };
      return request.formatQueryData(params, function(err, formatted) {
        expect(formatted.from < formatted.to)
        .to.be.true;

        return done();
      });
    });

    it('should convert date into unix timestamp', function() {
      params = {
        caller_carrier: 'maaiitest.com',
        from: '02/01/2015',
        to: '02/02/2015'
      };
      return request.formatQueryData(params, (err, formatted) =>
        expect(formatted.from, formatted.to)
        .to.be.a('string')
        .and.to.have.length(13)
      );
    });
  });
});

          // include back after implenmentation of fake timeout
    // it 'should return error if timeout', (done) ->
    //   timeout = 10
    //   params = {
    //     caller_carrier: 'maaiitest.com',
    //     from: '1424736000',
    //     to: '1424736000'
    //   }
    //   request = new CallRequest(baseUrl, timeout)
    //   request.getCalls params, (err, val) ->
    //     expect err
    //     .to.be.an 'object'
    //       .with.a.property 'timeout', timeout
    //
    //     done()


    // TODO fix test case
    // - { [Error: Nock: No match for request GET http://this.is.dataprovider.com/api/v1/sip/cdr/query?caller_carrier=maaiitest.com&from=1432185335&to=1430185335 ] status: 404, code: undefined }
    // it 'should return an array of history objects in successful request', (done) ->
    //   params = {
    //     caller_carrier: 'maaiitest.com',
    //     from: '1432185335',
    //     to: '1430185335'
    //   }
    //   console.log(params)
    //   request.getCalls params, (err, body) ->
    //     console.log(err);
    //     console.log(body);
    //     expect body
    //     .to.be.an 'object'
    //     .that.have.all.keys [
    //       'offset',
    //       'content',
    //       'page_number',
    //       'page_size',
    //       'total_pages',
    //       'total_elements',
    //       'number_of_elements'
    //     ]
    //
    //     expect body.content[0]
    //     .to.be.an 'object'
    //     .that.to.include.keys [
    //       'duration',
    //       'caller_carrier',
    //       'caller_country',
    //       'callee_country',
    //       'caller',
    //       'callee',
    //       'start_time',
    //       'end_time',
    //       'type',
    //       'bye_reason'
    //     ]
    //
    //     done()
