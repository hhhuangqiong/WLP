{expect} = require 'chai'

objectAssign = require 'object-assign'

# object under test
mixin = require 'app/lib/requests/mixins/mumsErrorResponse'
mixin = mixin.default

describe 'MUMS Error Response mixin', ->

  mixer = null

  beforeEach ->
    mixer = objectAssign {}, mixin

  it 'respond to #prepareError', ->
    expect( mixer ).to.respondTo 'prepareError'

  # not sure about this 1
  it 'should allow to be called without parameter', ->
    expect(mixer.prepareError()).to.be.an.instanceof Error

  it 'returns an error object with specific payload', ->
    errorPayload =
      message: 'hello'
      code:    123
      status:  500

    e = mixer.prepareError errorPayload

    expect( e ).to.have.property 'message', 'hello'
    expect( e ).to.have.property 'code', 123
    expect( e ).to.have.property 'status', 500

