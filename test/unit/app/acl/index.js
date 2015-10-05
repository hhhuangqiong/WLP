var expect = require('chai').expect;
var sinon = require('sinon');
var _ = require('lodash');

var carrierQuerier = require('app/main/acl/carrierQueryService');
var AclManager = require('app/main/acl');
var NodeAcl = require('acl');

describe('AclManager', function() {
  var defaultUserId = 'root@companycom';
  var newUserId = 'user@companycom';
  var allowedCarrierId = 'allowedcarrierid';
  var existingCarrierId = 'existingcarrierid';
  var invalidCarrierId = 'invalidcarrierid';
  var carrierType = 'm800';
  var adminRole = 'admin';
  var invalidRole = 'vip';
  var noop = function() {};

  var carriers = [
    { carrierId: allowedCarrierId },
    { carrierId: existingCarrierId }
  ];

  var Acl;
  var acl;

  beforeEach(function() {
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

    Acl = new NodeAcl(new NodeAcl.memoryBackend());
    acl = new AclManager(Acl, carrierQuerier);
    Acl.allow(existingCarrierId, existingCarrierId, '*');
    Acl.addUserRoles(defaultUserId, existingCarrierId);
    Acl.addUserRoles(defaultUserId, acl._formatRoleString(carrierType, adminRole));
    Acl.allow('admin', 'index', '*');
  });

  afterEach(function() {
    carrierQuerier.getCarrier.restore();
    carrierQuerier.getCarriers.restore();
    carrierQuerier.getCarrierType.restore();
  });

  it('should have acl object', function() {
    expect(acl).to.be.an('object');
  });

  describe('#isValidCarrier', function() {
    it('should return true for existing carrier', function(done) {
      acl.isValidCarrier(existingCarrierId, function(err, existed) {
        expect(err).to.be.null;
        expect(existed).to.be.true;
        done();
      });
    });

    it('should return false for invalid carrier', function(done) {
      acl.isValidCarrier(invalidCarrierId, function(err, existed) {
        expect(err).to.be.null;
        expect(existed).to.be.false;
        done();
      });
    });
  });

  describe('#isAllowedForCarrier', function() {
    it('should return true if an user has permission', function(done) {
      acl.isAllowedForCarrier(defaultUserId, existingCarrierId, function(err, isAllowed) {
        expect(err).to.be.null;
        expect(isAllowed).to.be.true;
        done();
      });
    });

    it('should return false if an user has no permission', function(done) {
      acl.isAllowedForCarrier(newUserId, existingCarrierId, function(err, isAllowed) {
        expect(err).to.be.null;
        expect(isAllowed).to.be.false;
        done();
      })
    });
  });

  describe('#addCarrierGroup', function() {
    it('should return true with an existing carrier id', function(done) {
      acl.addCarrierGroup(existingCarrierId, function(err, added) {
        expect(err).to.be.null;
        expect(added).to.be.true;
        done();
      });
    });

    it('should return error with an invalid carrier id', function(done) {
      acl.addCarrierGroup(invalidCarrierId, function(err, added) {
        expect(err).to.not.be.null;
        done();
      })
    })
  });

  describe('#addUserCarrier', function() {
    it('should return false before adding permission for an user to access the carrier', function(done) {
      acl.isAllowedForCarrier(newUserId, existingCarrierId, function(err, isAllowed) {
        expect(err).to.be.null;
        expect(isAllowed).to.be.false;
        done();
      });
    });

    it('should add user to carrier group', function(done) {
      acl.addUserCarrier(newUserId, existingCarrierId, function(err) {
        expect(err).to.be.null;

        acl.isAllowedForCarrier(newUserId, existingCarrierId, function(err, isAllowed) {
          expect(err).to.be.null;
          expect(isAllowed).to.be.true;
          done();
        });
      });
    });

    it('should throw error when adding an user to an invalid carrier', function(done) {
      acl.addUserCarrier(newUserId, invalidCarrierId, function(err) {
        expect(err).to.not.be.null;
        done();
      });
    });
  });

  describe('#removeUserCarrier', function() {
    it('should return error when removing an invalid carrier permission from an user', function(done) {
      acl.removeUserCarrier(newUserId, invalidCarrierId, function(err) {
        expect(err).to.not.be.null;
        done();
      });
    });

    it('should not return error when removing carrier permission from an user', function(done) {
      acl.removeUserCarrier(newUserId, existingCarrierId, function(err) {
        expect(err).to.be.null;
        done();
      });
    });
  });

  describe('#addUserRole', function() {
    it('should not return error when assigning a role to a given user', function(done) {
      acl.addUserRole(newUserId, existingCarrierId, adminRole, function(err) {
        expect(err).to.be.null;

        Acl.hasRole(newUserId, acl._formatRoleString(carrierType, adminRole), function(err, hasRole) {
          expect(err).to.be.null;
          expect(hasRole).to.be.true;
          done();
        });
      });
    });
  });

  describe('#removeUserRole', function() {
    it('should return error when removing an unassigned role from a given user', function(done) {
      acl.removeUserRole(newUserId, invalidCarrierId, invalidRole, function(err) {
        expect(err).to.not.be.null;
        done();
      });
    });

    it('should not return error when removing an assigned role from a given user', function(done) {
      acl.removeUserRole(defaultUserId, existingCarrierId, adminRole, function(err) {
        expect(err).to.be.null;
        done();
      });
    });
  });

  describe('#removeAllUserRoles', function() {
    it('should not return error when removing roles of a given user', function(done) {
      acl.removeAllUserRoles(defaultUserId, function(err) {
        expect(err).to.be.null;

        Acl.userRoles(defaultUserId, function(err, roles) {
          expect(roles).to.be.empty;
          done();
        });
      });
    });
  });
});
