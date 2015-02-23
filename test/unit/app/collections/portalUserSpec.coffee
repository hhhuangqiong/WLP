PortalUser = require 'app/collections/portalUser'

_      = require 'lodash'
expect = require('chai').expect

describe 'Portal User', ->
  tokenVal = 'arbitrary'

  describe '::hashInfo', ->
    it 'should return information in expected structure', (done) ->
      password = 'pa$$word'

      PortalUser.hashInfo password, (err, hash)->
        expect hash
          .to.have.keys [ 'salt', 'hashedPassword' ]

        done()

  describe '#googleAuthInfo', ->

    it 'should apply the generated values', ->
      p = new PortalUser()
      ret = p.googleAuthInfo()

      expect(ret).to.be.an.instanceof PortalUser

      expect p.googleAuth.toObject()
        .to.have.keys ['key', 'encoding', 'qrCodeUrl']

  describe '#addToken', ->
    p         = null
    event     = 'signup'
    predicate = (t) -> t.event == event

    beforeEach ->
      p = new PortalUser()

    it 'should generate the token', ->
      p.addToken event, tokenVal

      expect _.findIndex p.tokens, predicate
        .to.gte 0

    it 'should accept token value passed', ->
      p.addToken event, tokenVal

      expect _.find p.tokens, predicate
        .to.have.property 'value'
        .and.equal tokenVal

    it 'should only have 1 signup token maximum', ->
      p.addToken(event, tokenVal).addToken(event, tokenVal)

      expect _.filter(p.tokens, predicate).length
        .to.eql 1

  describe '#tokenOf', ->
    p = null
    event = 'foobar'

    beforeEach ->
      p = new PortalUser()
      p.addToken event, tokenVal

    it 'should return the token object found', ->
      expect( p.tokenOf event ).to.exist
      expect( p.tokenOf 'notexist' ).to.not.exist

  describe '#isTokenExpired', ->
    p = null
    event = 'bar'

    beforeEach ->
      p = new PortalUser()
      p.addToken event, tokenVal

    it 'should be expired', (done) ->
      # better to use sinon's fake timer
      setTimeout ->
        expect( p.isTokenExpired event, 0, 'milliseconds' ).to.be.true
        done()
      , 100

    it 'should not be expired', ->
      expect( p.isTokenExpired event, 1, 'hours' ).to.be.false

    it 'should throw Error if the token could not be found', ->
      expect( -> p.isTokenExpired 'notexist', 1, 'minutes' ).to.throw Error

  describe '#removeToken', ->
    p   = null
    evt = 'arbitrary'

    beforeEach ->
      p = new PortalUser()
      p.addToken evt, tokenVal

    it 'should remove the token of type', ->
      p.removeToken evt
      # assume tokenOf behaves correctly
      expect( p.tokenOf evt ).to.be.empty
