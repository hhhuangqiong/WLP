{expect} = require 'chai'
nock     = require 'nock'
sinon    = require 'sinon'

# to be spied
request  = require 'superagent'

{OPERATION_TYPE_ADD, WhitelistRequest} = require 'app/lib/requests/Whitelist'

describe 'Whitelist Request', ->
  wl        = null
  hostPart  = 'http://localhost'
  carrierId = 'carrierId'
  path      = "/1.0/carriers/#{carrierId}/whitelist"
  usernames = ['username1']
  opts      =
    baseUrl: hostPart

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
            status:  500
            code:    30000
            message: "Internal Server Error"

      wl.add carrierId, usernames, (err)->
        expect( err ).to.not.be.undefined
        done()

  describe '#get', ->
    getOpts =
      from: 0
      to:   4

    it 'should throw Error on missing required parameters', ->
      expect ->
        wl.get()
        wl.get(carrierId)
      .to.throw Error, /required/i

    it 'should allow for optional parameters', ->
      expect ->
        wl.get(carrierId, ->)
        wl.get(carrierId, getOpts, ->)
      .to.not.throw Error

    it 'should not send optional parameter if not present', (done) ->
      nock hostPart
        # could i do this better?
        .get "#{path}?from=#{getOpts.from}&to=#{getOpts.to}"
        .reply 200,
          "carrierId": carrierId
          "userCount": 5
          "indexRange":
            "from": getOpts.from
            "to": getOpts.to
            "pageNumberIndex": 0
          "whitelist": [
            "+85291111111",
            "+85291111112",
            "+85291111113",
            "+85291111114",
            "+85291111115"]

        spy = sinon.spy request, 'get'

        # NB: no need to check querystring for nock won't reply
        # with the corresponding payload if querystring not match
        wl.get carrierId, getOpts, (err, result) ->
          expect( spy.firstCall.args[0] )
            .to.match new RegExp requestPath

          # to make sure not mistakenly getting another payload
          expect( result.userCount ).to.eql 5
          found = result.whitelist 
          expect(found).to.be.not.empty
          expect(found).to.have.length.of 5

          spy.reset()
          done()
