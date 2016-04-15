{expect}   = require 'chai'

# object under test
UserRequest = require 'app/lib/requests/mums/User'
UserRequest = UserRequest.default

describe.skip 'UserRequest', ->
  request = null
  baseUrl = 'http://www.mums.com/api/1.0'
  timeout = 5000

  it 'should throw error without baseUrl', ->
    expect ->
      request = new UserRequest()
    .to.throw Error

  it 'should throw error with invalid baseUrl', ->
    expect ->
      request = new UserRequest('http:invalid.url')
    .to.throw Error

  it 'should have default timeout of 5000ms', ->
    expect request = new UserRequest(baseUrl)
    .to.have.deep.property 'opts.timeout'
    .equals 5000

  describe 'UserQuery', ->

    beforeEach ->
      request = new UserRequest(baseUrl, timeout);

    afterEach ->
      request = null;

    it 'should have baseUrl', ->
      expect request
      .to.have.deep.property 'opts.baseUrl'
      .to.be.a 'string'

    it 'should have methods', ->
      expect request
      .to.have.deep.property 'opts.methods'
      .to.be.a 'object'
