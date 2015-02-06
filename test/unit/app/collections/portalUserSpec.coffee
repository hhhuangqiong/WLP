PortalUser = require 'app/collections/portalUser'

_      = require 'lodash'
expect = require('chai').expect

describe 'Portal User', ->

  describe '::hashInfo', ->
    it 'should return information in expected structure', (done) ->
      password = 'pa$$word'

      PortalUser.hashInfo password, (err, hash)->
        expect hash
          .to.have.keys [ 'salt', 'hashedPassword' ]

        done()

  describe '#signUpToken', ->
    p         = null;
    predicate = (t) -> t.event == 'signup'

    beforeEach ->
      p = new PortalUser()

    it 'should generate the token', ->
      p.signUpToken()

      expect _.findIndex p.tokens, predicate
        .to.gte 0

    it 'should accept token value passed', ->
      tokenVal = 'testing'
      p.signUpToken tokenVal

      expect _.find p.tokens, predicate
        .to.have.property 'value'
        .and.equal tokenVal

    it 'should only have 1 signup token maximum', ->
      p.signUpToken().signUpToken()

      expect _.filter(p.tokens, predicate).length
        .to.eql 1

  describe '#tokenOf', ->
    p = null

    beforeEach ->
      p = new PortalUser()
      p.signUpToken()

    it 'should return the token object found', ->
      expect( p.tokenOf 'signup' ).to.exist
      expect( p.tokenOf 'notexist' ).to.not.exist

  describe '#isTokenExpired', ->
    p = null

    beforeEach ->
      p = new PortalUser()
      p.signUpToken()

    it 'should be expired', (done) ->
      # better to use sinon's fake timer
      setTimeout ->
        expect( p.isTokenExpired 'signup', 0, 'milliseconds' ).to.be.true
        done()
      , 100

    it 'should not be expired', ->
      expect( p.isTokenExpired 'signup', 1, 'hours' ).to.be.false

    it 'should throw Error if the token could not be found', ->
      expect( -> p.isTokenExpired 'notexist', 1, 'minutes' ).to.throw Error

