{ expect }               = require 'chai'
sinon                    = require 'sinon'

PortalUser               = require 'app/collections/portalUser'
{ SIGNUP_EVENT, SignUp } = require 'app/lib/portal/SignUp'

describe 'SignUp service', ->

  describe '#activate', ->
    user     = null
    signUp   = new SignUp()
    password = 'arbitrary'

    beforeEach ->
      user = new PortalUser()

    it 'should remove the token from user', (done) ->
      sinon.stub(user, 'save').yields null, user, 1

      user.addToken SIGNUP_EVENT, 'whatever'

      signUp.activate user, password, ->
        expect user.tokenOf SIGNUP_EVENT
          .to.be.empty

        user.save.restore()
        done()

    # too intrusive; PoC
    it 'should trigger the password generation', (done) ->
      sinon.stub(user, 'validate').yields null

      sinon.stub PortalUser, 'hashInfo', ->
        PortalUser.hashInfo.restore()
        user.validate.restore()
        done()

      signUp.activate user, password, ->
        console.log 'should not be triggered'

  describe '#verify', ->
    user      = null
    signUp    = new SignUp()

    describe 'invalid parameter(s)', ->
      describe 'invalid user', ->
        it 'should throw Error', ->
          expect ->
            signUp.verify {}, 'token', new Date()
          .to.throw /portaluser/i

      describe 'invalid token value', ->
        it 'should throw Error', ->
          expect ->
            signUp.verify new PortalUser(), '', new Date()
          .to.throw /required/i

      describe 'invalid "after" date', ->
        it 'should throw Error', ->
          expect ->
            signUp.verify new PortalUser(), 'tokenValue', ''
          .to.throw /date/i
          expect ->
            signUp.verify new PortalUser(), 'tokenValue', new Date()
          .to.not.throw /date/i

    describe 'for users that do not have token', ->
      beforeEach ->
        user = new PortalUser()

      it 'should throw Error', ->
        expect ->
          signUp.verify user, 'dontcare', new Date()
        .to.throw /token/i

    describe 'for users that have a valid token', ->
      compareTo = 'cannedValue'
      clock = null

      describe 'and the token has not expired', ->
        beforeEach ->
          clock = sinon.useFakeTimers()
          clock.tick 5000

          user = new PortalUser()
          user.addToken SIGNUP_EVENT, compareTo

        afterEach ->
          clock.restore()

        it 'should return true', ->
          clock.tick -5000

          expect signUp.verify user, compareTo, new Date()
            .to.be.true

      describe 'but the token has expired', ->

        beforeEach ->
          clock = sinon.useFakeTimers()

          user = new PortalUser()
          user.addToken SIGNUP_EVENT, compareTo

        afterEach ->
          clock.restore()

        it 'should return false', ->
          clock.tick 5000

          expect signUp.verify user, compareTo, new Date()
            .to.be.false
