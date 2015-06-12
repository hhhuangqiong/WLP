sinon = require 'sinon'
{expect} = require 'chai'

# object under test
handler = require 'app/server/utils/gridfs'

describe 'gridFS util', ->
  filePath = 'public/images/logo-m800.png'

  describe '#getGridFS', ->
    it 'should throw error without mongoose connection', ->
      handler.getGridFS (err, result) ->
        expect err
          .to.be.an.Object
        expect err.message
          .to.equals 'missing db argument\nnew Grid(db, mongo)'

  describe '#addFile', ->
    beforeEach ->
      handler = require 'app/server/utils/gridfs'
      sinon.stub handler, "getGridFS", () -> {}

    it 'should throw error without specifying file path', ->
      handler.addFile '', {}, (err, doc) ->
        expect err
          .to.be.an.Object
        expect err.message
          .to.equals 'missing file path'
