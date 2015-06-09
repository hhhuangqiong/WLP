{expect}          = require 'chai'

url = require 'app/utils/url'

describe 'url utils', ->

  hostname = 'example.com'
  port = 1234

  describe '#baseUrl', ->

    describe 'when no env variables have been set', ->
      APP_HOST = null
      APP_PORT = null

      beforeEach ->
        {APP_HOST, APP_PORT } = process.env
        delete process.env.APP_HOST
        delete process.env.APP_PORT

      afterEach ->
        process.env.APP_HOST = APP_HOST
        process.env.APP_PORT = APP_PORT

      it 'should use "localhost" & no port as default', ->
        expect( url.baseUrl() ).to.eql 'http://localhost'

    describe 'when APP_HOST & APP_PORT has been set', ->

      beforeEach ->
        process.env.APP_HOST = hostname
        process.env.APP_PORT = port

      afterEach ->
        delete process.env.APP_HOST
        delete process.env.APP_PORT

      it "should use \"#{hostname}\" as host name", ->
        expect( url.baseUrl() ).to.eql "http://#{hostname}:#{port}"

      it 'should be able to use "https" as protocol', ->
        expect( url.secureBaseUrl(port, hostname, true) ).to.eql "https://#{hostname}:#{port}"

    describe '#secureBaseUrl', ->

      it 'should be able to use "https" as protocol', ->
        expect( url.secureBaseUrl(port, hostname) ).to.eql "https://#{hostname}:#{port}"

