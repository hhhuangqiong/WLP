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
  baseUrl = 'http://this.is.dataprovider.com/api/v1'
  url     = '/sip/cdr/query'
  delay   = 20
  timeout = 100

  describe 'CallQuery', ->

    beforeEach (done)->
      timeout = 100
      request = new CallRequest(baseUrl, timeout)
      params  = {
        carrierId: 'maaiitest.com',
        from: '02/24/2015',
        to: '02/24/2015',
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
        carrierId: 'maaiitest.com',
        from: '02/02/2015',
        to: '02/01/2015'
      }
      request.formatQueryData params, (err, formatted) ->
        expect formatted.from < formatted.to
        .to.be.true

        done()

    it 'should convert date into unix timestamp', ->
      params = {
        carrierId: 'maaiitest.com',
        from: '02/01/2015',
        to: '02/02/2015'
      }
      request.formatQueryData params, (err, formatted) ->
        expect formatted.from, formatted.to
        .to.be.a 'string'
        .and.to.have.length(13)

    it 'should return error if timeout', (done) ->
      timeout = 10
      params = {
        carrierId: 'maaiitest.com',
        from: '02/24/2015',
        to: '02/24/2015'
      }
      request = new CallRequest(baseUrl, timeout)
      request.getCalls params, (err, val) ->
        expect err
        .to.be.an 'object'
          .with.a.property 'timeout', timeout

        done()

    it 'should return an array of history objects in successful request', (done) ->
      params = {
        carrierId: 'maaiitest.com',
        from: '02/24/2015',
        to: '02/24/2015'
      }
      request.getCalls params, (err, body) ->
        expect body
        .to.be.an 'object'
        .that.have.all.keys [
          'offset',
          'contents',
          'pageNumber',
          'pageSize',
          'totalPages',
          'totalElements'
        ]

        expect body.contents[0]
        .to.be.an 'object'
        .that.to.include.keys [
          'duration',
          'caller_carrier',
          'callee_carrier',
          'caller_country',
          'callee_country',
          'caller',
          'callee',
          'start_time',
          'end_time',
          'type',
          'bye_reason'
        ]

        done()
