{expect} = require 'chai'

# object under test
Email = require 'app/collections/email'

describe 'Email collection', ->
  email = null

  beforeEach ->
    email = new Email()

  describe '#templateName', ->
    it 'should be able to set the name', ->
      expect( email.templateName() ).to.not.exist

      name = 'foo'
      email.templateName name
      expect( email.templateName() ).to.equal name

  describe '#templateData', ->
    it 'should be able to set the name', ->
      expect( email.templateData() ).to.be.empty

      data = {'foo':'bar'}
      email.templateData data
      expect( email.templateData() ).to.equal data




