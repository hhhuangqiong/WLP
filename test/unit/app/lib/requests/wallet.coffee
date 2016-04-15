{expect}   = require 'chai'
nconf      = require 'nconf'
nock       = require 'nock'
moment     = require 'moment'
util       = require 'util'

# object under test
WalletRequest = require 'app/lib/requests/boss/Wallet'
WalletRequest = WalletRequest.default

describe 'WalletRequest', ->
  request = null
  params  = {}
  baseUrl = 'http://this.is.mums'
  url     = '/api/walletBalance'
  delay   = 20
  timeout = 100

  describe 'WalletQuery', ->

    beforeEach ->
      timeout = 100
      request = new WalletRequest(baseUrl, timeout)
      params  = {
        requestId: '3ab4cd',
        carrier: 'yato.maaii.com',
        number: '91234567'
        sessionUserName: 'Tester',
      }

      nock(baseUrl)
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
        })

    afterEach ->
      request = null

    it 'should not throw error without mandatory parameters', ->
      params = {}

      fn = request.validateQuery params, (err, formatted) ->
        expect(err).to.not.be.undefined

    it.skip 'should not return error if timeout', (done) ->
      timeout = 10
      request = new WalletRequest(baseUrl, timeout)
      params  = {
        requestId: '3ab4cd',
        carrier: 'yato.maaii.com',
        number: '91234567'
        sessionUserName: 'Tester',
      }
      request.getWalletBalance params, (err, val) ->
        expect err
        .to.be.null

        done()

    it 'should return a wallet array in successful request', (done) ->
      request.getWalletBalance params, (err, body) ->
        expect body
        .to.be.an 'array'
        expect body[0]
        .to.be.an 'object'
        .that.have.all.keys [
          'id',
          'currency',
          'balance',
          'expiryDate',
          'serviceType',
          'walletType',
          'lastTopupDate',
          'ocsStatus'
        ]

        done()
