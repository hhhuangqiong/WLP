{expect}               = require 'chai'
sinon                  = require 'sinon'
Queue                  = require 'kue'
Email                  = require 'app/collections/email'

# object under test
{ JOB_TYPE, EmailJob } = require 'app/server/tasks/EmailJob'

describe 'Email Job', ->

  describe 'constructor', ->

    it 'should throw error on invalid parameter', ->
      expect ->
        new EmailJob()
      .to.throw /queue/i

      expect ->
        new EmailJob( sinon.createStubInstance Queue )
        new EmailJob( sinon.createStubInstance Queue, {} )
      .to.throw /process/i

      expect ->
        new EmailJob sinon.createStubInstance( Queue ), ->
      .to.not.throw Error

  describe '#create', ->
    job   = null
    email = null

    meta =
      meta:
        from:    'from@example.com'
        to:      'to@example.com'
        subject: 'subject'
    templateName = 'templateName'
    templateData = { data: 'data' }

    stub  = sinon.createStubInstance( Queue )
    # bad, stub way too many APIs
    stub.create = ->
      { save: (cb) -> cb() }

    spy = sinon.spy stub, 'create'

    beforeEach ->
      # do not care 'processFn' for now
      job = new EmailJob stub, ->

      email = new Email meta
      email.templateName(templateName)
      email.templateData(templateData)

    it 'should provide the queue with the correct data format', (done) ->
      job.create email, ->
        argsList = stub.create.getCall(0).args
        expect( argsList[0] ).to.equal JOB_TYPE

        queueData = argsList[1]

        expect( queueData.mailOpts ).to.include meta.meta
        expect( queueData.templateName ).to.equal templateName
        expect( queueData.templateData ).to.equal templateData

        done()


