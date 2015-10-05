var expect = require('chai').expect;
var sinon = require('sinon');
var _ = require('lodash');
var express = require('express');
var request = require('supertest');

var carrierQuerier = require('app/main/acl/carrierQueryService');
var AclManager = require('app/main/acl');
var NodeAcl = require('acl');

describe('AclManager Middleware', function() {
  var defaultUserId = 'root@companycom';
  var newUserId = 'user@companycom';
  var allowedCarrierId = 'allowedcarrierid';
  var existingCarrierId = 'existingcarrierid';
  var invalidCarrierId = 'invalidcarrierid';
  var carrierType = 'm800';
  var adminRole = 'admin';

  var testingRole = 'a'; // it does not affect anything
  var testingCarrierId = allowedCarrierId;
  var testingResource = 'resource';
  var testingUserId = defaultUserId;

  var getUserId = function(req) {
    return req.header('Authorization');
  };

  var getCarrierId = function(req) {
    return req.params.identity;
  };

  var getResource = function(req) {
    return req.params.resource;
  };

  var response200 = function(req, res) {
    res.sendStatus(200);
  };

  var Acl = new NodeAcl(new NodeAcl.memoryBackend());
  var acl = new AclManager(Acl, carrierQuerier);

  var app = express();
  app.get('/:role/:identity/:resource', acl.middleware(getUserId, getCarrierId, getResource, 'get'), response200);

  var carriers = [
    { carrierId: allowedCarrierId },
    { carrierId: existingCarrierId }
  ];

  beforeEach(function(done) {
    sinon.stub(carrierQuerier, 'getCarriers', function(cb) {
      cb(null, carriers);
    });

    sinon.stub(carrierQuerier, 'getCarrier', function(carrierId, cb) {
      var carrier = _.find(carriers, { carrierId: carrierId });
      cb(null, !!carrier);
    });

    sinon.stub(carrierQuerier, 'getCarrierType', function(carrierId, cb) {
      cb(null, carrierType);
    });

    acl.addCarrierGroup(testingCarrierId, function(err) {
      if (!err)
        acl.addUserCarrier(testingUserId, testingCarrierId, function(err) {
          done(err);
        });
    })
  });

  afterEach(function() {
    carrierQuerier.getCarrier.restore();
    carrierQuerier.getCarriers.restore();
    carrierQuerier.getCarrierType.restore();
  });

  describe('#middleware', function() {
    it('should return 200', function(done) {
      request(app)
        .get('/' + testingRole + '/' + testingCarrierId + '/' + testingResource)
        .set('Authorization', testingUserId)
        .expect(200)
        .end(function(err) {
          if (err) return done(err);
          done();
        });
    });

    it('should return a 404 error when accessing an invalid carrier', function(done) {
      request(app)
        .get('/' + testingRole + '/' + invalidCarrierId + '/' + testingResource)
        .set('Authorization', testingUserId)
        .expect(404)
        .end(function(err) {
          if (err) return done(err);
          done();
        });
    });

    it('should return a 401 error when accessing an unauthorized carrier', function(done) {
      request(app)
        .get('/' + testingRole + '/' + existingCarrierId + '/' + testingResource)
        .set('Authorization', testingUserId)
        .expect(401)
        .end(function(err) {
          if (err) return done(err);
          done();
        });
    });
  });
});
