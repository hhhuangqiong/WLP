{expect}   = require 'chai'

# object under test
SpeakeasyWrapper = require 'app/lib/auth/SpeakeasyWrapper'

describe 'Speakeasy Wrapper', ->
  ga = null

  describe 'invalid options', ->
    it 'should throw error for invalid encoding', ->
      expect ->
        ga = new SpeakeasyWrapper({ encoding: 'xyz' })
      .to.throw /encoding/i
      expect ->
        ga = new SpeakeasyWrapper({ encoding: 'base32' })
      .to.not.throw /encoding/i

  describe '#qrCodeURL', ->
    ga = new SpeakeasyWrapper()

    it 'should return a string', ->
      expect ga.qrCodeURL()
        .to.be.a 'string'









