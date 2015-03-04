{expect}   = require 'chai'
nconf      = require 'nconf'
nock       = require 'nock'
moment     = require 'moment'
util       = require 'util'

# object under test
TransactionRequest = require 'app/lib/requests/boss/Transaction'

describe 'TransactionRequest', ->
  request = null
  params  = {}
  baseUrl = 'http://this.is.boss/api'
  url     = '/transactionHistory'
  delay   = 20
  timeout = 100

  describe 'TransactionQuery', ->

    beforeEach ->
      timeout = 100
      request = new TransactionRequest(baseUrl, timeout)
      params  = {
        requestId: '3ab4cd',
        startDate: '02/24/2015',
        endDate: '02/24/2015',
        rechargeType: ['promotional', 'CreditCard'],
        status: ['failure', 'pending']
      }

      nock(baseUrl)
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
        })

    afterEach ->
      request = null

    it 'should swap startDate with endDate if startDate is later than endDate', ->
      params = {
        startDate: '02/02/2015',
        endDate: '02/01/2015'
      }
      request.formatQueryData params, (err, formatted) ->
        expect formatted.startDate < formatted.endDate
        .to.be.true

    it 'should convert date into format YYYYMMDDhhmmss', ->
      request.formatQueryData params, (err, formatted) ->
        expect formatted.startDate, formatted.endDate
        .to.be.a 'string'
        .and.to.have.length(14)

    it 'should convert arrays into strings', ->
      request.formatQueryData params, (err, formatted) ->
        expect formatted.rechargeType
        .to.be.a 'string'
        expect formatted.status
        .to.be.a 'string'

    it 'should return error if timeout', (done) ->
      timeout = 10
      request = new TransactionRequest(baseUrl, timeout)
      params  = {
        requestId: params.requestId,
        startDate: '02/24/2015',
        endDate: '02/24/2015'
      }
      request.getTransactions params, (err, val) ->
        expect err
        .to.be.an 'object'
          .with.a.property 'timeout', timeout

        done()

    it 'should return an array of history objects in successful request', (done) ->
      params = {
        requestId: params.requestId,
        startDate: '02/24/2015',
        endDate: '02/24/2015'
      }
      request.getTransactions params, (err, body) ->
        expect body
        .to.be.an 'array'

        expect body[0]
        .to.be.an 'object'
        .that.have.all.keys [
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
        ]

        done()
