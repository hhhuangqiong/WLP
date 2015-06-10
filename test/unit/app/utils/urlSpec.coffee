{expect} = require 'chai'

# object under test
url      = require 'app/utils/url'

describe 'url utils', ->
  hostname = 'example.com'
  port = 1234
  env = process.env

  describe '#baseUrl', ->
    sandbox = null

    describe 'when no env variables have been set', ->
      APP_HOSTNAME = null
      APP_PORT = null

      beforeEach ->
        {APP_HOSTNAME, APP_PORT } = process.env
        delete process.env.APP_HOSTNAME
        delete process.env.APP_PORT

      afterEach ->
        process.env.APP_HOSTNAME = APP_HOSTNAME
        process.env.APP_PORT = APP_PORT

      it 'should use "localhost" & port "3000" as default', ->
        expect( url.baseUrl() ).to.eql 'http://localhost:3000'

    describe 'when "APP_HOSTNAME" & "APP_PORT" has been set', ->

      beforeEach ->
        process.env.APP_HOSTNAME = hostname
        process.env.APP_PORT = port

      afterEach ->
        delete process.env.APP_HOSTNAME
        delete process.env.APP_PORT

      it "should use \"#{hostname}\" as host name", ->
        expect( url.baseUrl() ).to.eql "http://#{hostname}:#{port}"

      it 'should be able to use "https" as protocol', ->
        expect( url.secureBaseUrl(port, hostname, true) ).to.eql "https://#{hostname}:#{port}"

    describe '#secureBaseUrl', ->

      it 'should be able to use "https" as protocol', ->
        expect( url.secureBaseUrl(port, hostname) ).to.eql "https://#{hostname}:#{port}"

