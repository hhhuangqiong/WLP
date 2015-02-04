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



