{expect}          = require 'chai'
sinon             = require 'sinon'
# collaborator
Mailer            = require 'app/lib/mailer/templateMailer'
# object under test
emailJobProcessor = require 'app/server/tasks/emailJobProcessor'

describe 'Email job processor', ->
  mailerStub = sinon.createStubInstance Mailer
  fakeMailer = { send: -> }

  it 'should throw Error on invalid argument', ->
    expect ->
      emailJobProcessor()
    .to.throw Error, /mailer/i
    expect ->
      emailJobProcessor( {} )
    .to.throw Error, /send/i
    expect ->
      emailJobProcessor mailerStub
      emailJobProcessor fakeMailer
    .to.not.throw Error

  it 'should return a function with correct arity', ->
    fn = emailJobProcessor( mailerStub )
    expect( fn.length ).to.equal 2

  # not using 'done' with 'it' since it's testing about arguments
  it 'should pass the correct arguments to mailer', ->
    fn = emailJobProcessor fakeMailer
    method = 'send'
    sinon.spy fakeMailer, method
    job =
      data:
        mailOpts:
          from: 'from@example.com'
          to: 'from@example.com'
      templateName: 'templateName'
      templateData:
        data: 'data'

    doneCB = ->

    fn(job, doneCB)

    argsList = fakeMailer[method].getCall(0).args
    expect( argsList[0] ).to.equal job.data.mailOpts
    expect( argsList[1] ).to.equal job.data.templateName
    expect( argsList[2] ).to.equal job.data.templateData
    # correct?
    expect( argsList[3] ).to.eql doneCB

