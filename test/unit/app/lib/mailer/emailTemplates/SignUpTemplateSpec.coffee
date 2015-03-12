{ expect } = require 'chai'

# object under test
SignUpTemplate = require 'app/lib/mailer/emailTemplates/SignUpTemplate'

describe 'Sign Up template', ->
  templateName = 'templateName'
  mailOpts =
    from: 'sender@email.com'
    subject: 'template subject'

  describe 'constructor', ->

    it 'should throw Error on invalid parameters', ->
      expect ->
        new SignUpTemplate()
      .to.throw /template/

      expect ->
        new SignUpTemplate(templateName)
        new SignUpTemplate(templateName, { from: mailOpts.from })
        new SignUpTemplate(templateName, { subject: mailOps.subject })
      .to.throw /(from|subject)/

      expect ->
        new SignUpTemplate(templateName, mailOpts)
      .to.not.throw Error

    it 'should have `templateFolderName` property', ->
      t = new SignUpTemplate(templateName, mailOpts)
      expect(t).to.have.property('templateFolderName')

  describe '#data', ->
    it 'should return an object', ->
      t = new SignUpTemplate(templateName, mailOpts)
      expect t.data({})
        .to.be.an 'Object'






