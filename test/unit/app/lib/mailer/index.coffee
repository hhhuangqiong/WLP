_    = require 'underscore'
path = require 'path'

assert = require 'assert'

smtpTransport = require 'app/lib/mailer/transports/smtp'

# object under test
Mailer = require 'app/lib/mailer/mailer'

TemplateMailer = require 'app/lib/mailer/templateMailer'

assert process.env.recipient, 'Expect "recipient" to be set'

describe 'Template Mailer', ->
  transport = null
  mailer    = null
  tMailer   = null

  # inline for now; externalize it better
  opts =
    "smtp":
      "sender":
        "email": "issue.tracker@maaii.com"
        "name": "M800"
      "transport":
        "host": "smtp.m800400.com"
        "port": 25
        "tls":
          "rejectUnauthorized": false

  beforeEach ->
    #console.log '__dirname', __dirname
    transport = smtpTransport opts.smtp.transport
    mailer    = new Mailer transport
    tMailer   = new TemplateMailer mailer, { templatesDir: __dirname }

  it 'should send okay', (done) ->
    mailOpts =
      from:    opts.smtp.sender.email
      to:      process.env.recipient
      subject: 'Testing from CoffeeScript'

    tMailer.send mailOpts, 'test-only', {}, ->
      done()

