PortalUser = require 'app/collections/portalUser'

expect = require('chai').expect

describe 'Portal User', ->

  describe '::hashInfo', ->
    it 'should return the expected payload', (done) ->
      password = 'pa$$word'

      PortalUser.hashInfo password, (err, hash)->
        expect hash
          .to.have.keys [ 'salt', 'hashedPassword' ]

        done()




