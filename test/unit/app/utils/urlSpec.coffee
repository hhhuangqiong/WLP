{expect} = require 'chai'

# object under test
url      = require 'app/utils/url'

describe 'url utils', ->
  hostname = 'example.com'
  port = 1234
  env = process.env

  describe '#baseUrl', ->
    it 'should use "localhost" & port "3000" as default', ->
      expect( url.baseUrl() ).to.eql 'http://localhost:3000'

    it "should use \"#{hostname}\" as host name", ->
      expect( url.baseUrl(port, hostname) ).to.eql "http://#{hostname}:#{port}"

    it 'should be able to use "https" as protocol', ->
      expect( url.baseUrl(port, hostname, true) ).to.eql "https://#{hostname}:#{port}"
