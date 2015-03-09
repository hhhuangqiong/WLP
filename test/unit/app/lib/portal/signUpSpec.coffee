{ expect } = require 'chai'
sinon      = require 'sinon'
mongoose   = require 'mongoose'
_ = require 'lodash'

TemplateMailer           = require 'app/lib/mailer/templateMailer'
PortalUser               = require 'app/collections/portalUser'

# object under test
{ SIGNUP_EVENT, SignUp } = require 'app/lib/portal/SignUp'

describe 'SignUp service', ->
  user   = null
  signUp = null
  opts =
    from: 'admin@m800.com'
    subject: 'Please follow the instruction for sign up'

  describe '#initializeUser', ->
    createBy = mongoose.Types.ObjectId()
    user     = null

    beforeEach ->
      user = new PortalUser { username: 'email@example.com' }
      #should match the mongoose save cb
      sinon.stub( user, 'save' ).yields null, user, 1

    afterEach ->
      user.save.restore()

    it 'should update corresponding properties', (done) ->
      tm = send: ->
      signUp = new SignUp tm, opts

      sinon.stub tm, 'send', ->
        expect( user ).to.have.property('createBy')
          .and.equal createBy
        expect(user.tokenOf SIGNUP_EVENT).is.be.an('object')
        done()

      # verify
      signUp.initializeUser user, createBy, ->

    it 'should trigger sending email', ->
      tm = send: ->
      mailerMock = sinon.mock tm
      mailerMock.expects('send').withArgs(_.assign({to: user.username}, opts)).once()

      signUp = new SignUp tm, opts

      # mocked the call; ignore the callback
      signUp.initializeUser user, createBy, ->

      #console.log 'args', mailerMock.args
      mailerMock.verify()

  describe '#activate', ->
    password = 'arbitrary'

    beforeEach ->
      user   = new PortalUser()
      signUp = new SignUp sinon.createStubInstance(TemplateMailer), opts

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
    beforeEach ->
      signUp    = new SignUp sinon.createStubInstance(TemplateMailer), opts

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
