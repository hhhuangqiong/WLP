{expect}   = require 'chai'
sinon      = require 'sinon'
SignUp     = require 'app/lib/portal/SignUp'
PortalUser = require 'app/collections/portalUser'

describe 'SignUp service', ->

  describe '#verify', ->
    user      = null
    signUp    = new SignUp()

    describe 'for users that do not have token', ->
      beforeEach ->
        user = new PortalUser()

      it 'should throw Error', ->
        expect ->
          signUp.verify user, 'dontcare', new Date()
        .to.throw Error

    describe 'for users that have a valid token', ->
      compareTo = 'cannedValue'
      clock = null

      describe 'And the token has not expired', ->
        beforeEach ->
          clock = sinon.useFakeTimers()
          clock.tick 5000

          user = new PortalUser()
          # extract as constants?
          user.addToken 'signup', compareTo

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
          user.addToken 'signup', compareTo

        afterEach ->
          clock.restore()

        it 'should return false', ->
          clock.tick 5000

          expect signUp.verify user, compareTo, new Date()
            .to.be.false
