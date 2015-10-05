var expect = require('chai').expect;
var mongoose = require('mongoose');
var Company = require('app/collections/company');

const rootConfig = {
  name: 'rootCompany',
  carrierId: 'm800',
  parentCompany: null,
  country: 'HK',
  timezone: 'UTC+8'
};

const resellerConfig = {
  name: 'resellerCompany',
  carrierId: 'reseller.com',
  reseller: true,
  parentCompany: mongoose.Types.ObjectId(),
  country: 'HK',
  timezone: 'UTC+8'
};

const sdkConfig = {
  name: 'sdkCompany',
  carrierId: 'sdk.m800-api.com',
  reseller: false,
  parentCompany: mongoose.Types.ObjectId(),
  country: 'HK',
  timezone: 'UTC+8'
};

const wlConfig = {
  name: 'wlCompany',
  carrierId: 'wl.com',
  reseller: false,
  parentCompany: mongoose.Types.ObjectId(),
  country: 'HK',
  timezone: 'UTC+8'
};

describe('Company Collection', function() {

  var rootCompany;
  var resellerCompany;
  var sdkCompany;
  var wlCompany;

  before(function() {
    rootCompany = new Company(rootConfig);
    resellerCompany = new Company(resellerConfig);
    sdkCompany = new Company(sdkConfig);
    wlCompany = new Company(wlConfig);
  });

  after(function() {
    rootCompany = null;
    resellerCompany = null;
    sdkCompany = null;
    wlCompany = null;
  });

  describe('#isSDK', function() {
    it('should return true for sdk company', function() {
      expect(sdkCompany.isSDK()).to.be.true;
    });

    it('should return false for non-sdk company', function() {
      expect(rootCompany.isSDK()).to.be.false;
      expect(resellerCompany.isSDK()).to.be.false;
      expect(wlCompany.isSDK()).to.be.false;
    });
  });

  describe('#getCompanyType', function() {
    it('should return m800 for root company', function() {
      expect(rootCompany.getCompanyType()).to.equals('m800');
    });

    it('should return reseller for reseller company', function() {
      expect(resellerCompany.getCompanyType()).to.equals('reseller');
    });

    it('should return reseller for sdk company', function() {
      expect(sdkCompany.getCompanyType()).to.equals('sdk');
    });

    it('should return reseller for wl company', function() {
      expect(wlCompany.getCompanyType()).to.equals('wl');
    });
  })
});
