{expect} = require 'chai'
nock     = require 'nock'
sinon    = require 'sinon'

# to be spied
request  = require 'superagent'

{OPERATION_TYPE_ADD, WhitelistRequest} = require 'app/lib/requests/Whitelist'

describe 'Whitelist Request', ->

  hostPart  = 'http://localhost'
  carrierId = 'carrierId'
  path      = "/1.0/carriers/#{carrierId}/whitelist"
  usernames = ['username1']

  requestPath = "#{hostPart}#{path}"

  describe 'constructor', ->

    it 'should throw Error if no baseUrl is passed', ->
      regex = /baseurl/i

      expect ->
        new WhitelistRequest()
      .to.throw Error, regex

      expect ->
        new WhitelistRequest baseUrl: '/whatever'
      .to.not.throw Error, regex

  describe '#add', ->
    wl = null
    opts =
      baseUrl: hostPart
    addPayload =
      operationType: OPERATION_TYPE_ADD
      usernames:     usernames

    beforeEach ->
      wl = new WhitelistRequest opts
      return

    it 'should throw Error on missing required arguments', ->
      expect ->
        wl.add()
        wl.add carrierId
      .to.throw Error, /required/i

      expect ->
        wl.add carrierId, usernames
        wl.add carrierId, usernames, {}
      .to.throw Error, /function/i

      expect ->
        wl.add carrierId, usernames, ->
      .to.not.throw Error

    it 'should request with correct method, url, & payload', (done) ->
      usernamesApplied = ['john']
      nock hostPart
        .put path, addPayload
        .reply 200,
          carrierId: carrierId
          usernamesApplied: usernamesApplied
          usernamesNotApplied: []

      spy = sinon.spy request, 'put'

      wl.add carrierId, usernames, (err, applied, notApplied) ->
        expect( spy.firstCall.args[0] )
          .to.match new RegExp requestPath

        expect( applied ).to.eql usernamesApplied
        expect( notApplied ).to.be.empty

        spy.reset()
        done()

    it 'should handle error correctly', (done) ->
      nock hostPart
        .put path, addPayload
        .reply 400,
          error:
            status: 500
            code: 30000
            message: "Internal Server Error"

      wl.add carrierId, usernames, (err)->
        expect( err ).to.not.be.undefined

        done()

