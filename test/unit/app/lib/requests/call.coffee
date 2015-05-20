{expect}   = require 'chai'
nconf      = require 'nconf'
nock       = require 'nock'
moment     = require 'moment'
Qs         = require 'qs'
util       = require 'util'

# object under test
CallRequest = require 'app/lib/requests/dataProviders/Call'
callResponse = require './responses/call.json'

describe 'CallRequest', ->
  request = null
  params  = {}
  #baseUrl = 'http://this.is.dataprovider.com/api/v1'
  baseUrl = 'http://this.is.dataprovider.com'
  url     = '/api/v1/sip/cdr/query'
  delay   = 20
  timeout = 100

  describe 'CallQuery', ->

    beforeEach (done)->
      timeout = 100
      request = new CallRequest(baseUrl, timeout)
      params  = {
        caller_carrier: 'maaiitest.com',
        from: '1432185335',
        to: '1430185335',
        page: 0,
        size: 20
      }

      request.formatQueryData params, (err, formatted) ->
        formattedParams = Qs.stringify(formatted)
        nock(baseUrl)
        .get(util.format('%s?%s', url, formattedParams))
        .delay(delay)
        .reply(200, callResponse)
        done()

    afterEach ->
      request = null

    it 'should swap startDate with endDate if startDate is later than endDate', (done)->
      params = {
        caller_carrier: 'maaiitest.com',
        from: '02/02/2015',
        to: '02/01/2015'
      }
      request.formatQueryData params, (err, formatted) ->
        expect formatted.from < formatted.to
        .to.be.true

        done()

    it 'should convert date into unix timestamp', ->
      params = {
        caller_carrier: 'maaiitest.com',
        from: '02/01/2015',
        to: '02/02/2015'
      }
      request.formatQueryData params, (err, formatted) ->
        expect formatted.from, formatted.to
        .to.be.a 'string'
        .and.to.have.length(13)

          # include back after implenmentation of fake timeout
    # it 'should return error if timeout', (done) ->
    #   timeout = 10
    #   params = {
    #     caller_carrier: 'maaiitest.com',
    #     from: '1424736000',
    #     to: '1424736000'
    #   }
    #   request = new CallRequest(baseUrl, timeout)
    #   request.getCalls params, (err, val) ->
    #     expect err
    #     .to.be.an 'object'
    #       .with.a.property 'timeout', timeout
    #
    #     done()


    # TODO fix test case 
    # - { [Error: Nock: No match for request GET http://this.is.dataprovider.com/api/v1/sip/cdr/query?caller_carrier=maaiitest.com&from=1432185335&to=1430185335 ] status: 404, code: undefined }
    # it 'should return an array of history objects in successful request', (done) ->
    #   params = {
    #     caller_carrier: 'maaiitest.com',
    #     from: '1432185335',
    #     to: '1430185335'
    #   }
    #   console.log(params)
    #   request.getCalls params, (err, body) ->
    #     console.log(err);
    #     console.log(body);
    #     expect body
    #     .to.be.an 'object'
    #     .that.have.all.keys [
    #       'offset',
    #       'content',
    #       'page_number',
    #       'page_size',
    #       'total_pages',
    #       'total_elements',
    #       'number_of_elements'
    #     ]
    #
    #     expect body.content[0]
    #     .to.be.an 'object'
    #     .that.to.include.keys [
    #       'duration',
    #       'caller_carrier',
    #       'callee_carrier',
    #       'caller_country',
    #       'callee_country',
    #       'caller',
    #       'callee',
    #       'start_time',
    #       'end_time',
    #       'type',
    #       'bye_reason'
    #     ]
    #
    #     done()
