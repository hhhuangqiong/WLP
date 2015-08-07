'use strict';
var mongoose = require('mongoose');
var gridfs = require('./../server/utils/gridfs');
var collectionName = 'Company';

const SDK_DOMAIN = '.m800-api.com';

var schema = new mongoose.Schema({
  parentCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  carrierId: {
    type: String,
    unique: true
  },

  // reflecting Company Type, either "Default" or "Reseller"
  reseller: {
    type: Boolean
  },
  logo: {
    type: mongoose.Schema.Types.ObjectId
  },
  themeType: {
    type: String
  },
  address: {
    type: String
  },
  categoryID: {
    type: String
  },
  country: {
    type: String,
    required: true
  },
  timezone: {
    type: String,
    required: true
  },
  accountManager: {
    type: String
  },
  billCode: {
    type: String
  },
  expectedServiceDate: {
    type: Date
  },
  contractNumber: {
    type: String
  },
  referenceNumber: {
    type: String
  },
  features: {
    type: Object,
    default: []
  },
  businessContact: {
    name: {
      type: String
    },
    phone: {
      type: String
    },
    email: {
      type: String
    }
  },
  technicalContact: {
    name: {
      type: String
    },
    phone: {
      type: String
    },
    email: {
      type: String
    }
  },
  supportContact: {
    name: {
      type: String
    },
    phone: {
      type: String
    },
    email: {
      type: String
    }
  },
  widgets: {
    overview: [],
    stores: [],
    calls: [],
    im: [],
    sms: [],
    vsf: []
  },
  serviceConfig: {
    developerKey: {
      type: String
    },
    developerSecret: {
      type: String
    },
    applicationId: {
      type: String
    },
    applications: {
      ios: {
        name: {
          type: String,
          default: null
        }
      },
      android: {
        name: {
          type: String,
          default: null
        }
      }
    }
  },
  status: {
    type: String,
    required: true,
    default: 'inactive'
  },
  createAt: {
    type: Date,
    default: Date.now
  },
  createBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PortalUser'
  },
  updateAt: {
    type: Date,
    default: Date.now
  },
  updateBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PortalUser'
  }
}, { collection: collectionName });

schema.virtual('role').get(function() {
  if (this.isRootCompany()) {
    return 'a';
  }

  if (this.reseller) {
    return 'r';
  }

  return 'w';
});

schema.virtual('identity').get(function() {
  return this.carrierId || null;
});

schema.method('addLogo', function(filePath, options, cb) {
  gridfs.addFile(filePath, options, (err, fileDoc)=> {
    if (err) return new Error(err);
    this.logo = fileDoc._id;
    return this.save(cb);
  });
});

/**
 * @method activate
 *
 * @callback cb {Function}
 * @param err {Object} error
 * @param doc {Object} company payload
 * @param doc.carrierId {String} company carrier id
 * @param doc.status {String} company status
 */
schema.method('activate', function(cb) {
  this.status = 'active';
  return this.save(function(err, company) {
    if (err)
      throw err;

    return cb(null, { carrierId: company.carrierId, status: company.status });
  });
});

/**
 * @method deactivate
 *
 * @callback cb {Function}
 * @param err {Object} error
 * @param doc {Object} company payload
 * @param doc.carrierId {String} company carrier id
 * @param doc.status {String} company status
 */
schema.method('deactivate', function(cb) {
  this.status = 'inactive';
  return this.save(function(err, company) {
    if (err)
      throw err;

    return cb(null, { carrierId: company.carrierId, status: company.status });
  });
});

schema.method('isRootCompany', function() {
  return !this.parentCompany;
});

schema.method('getCompanyType', function() {
  if (this.isRootCompany()) {
    return 'm800';
  } else if (this.reseller) {
    return 'reseller';
  } else if (this.isSDK()) {
    return 'sdk';
  } else {
    return 'wl';
  }
});

schema.method('isSDK', function() {
  return this.carrierId.indexOf(SDK_DOMAIN) > -1;
});

schema.method('getServiceType', function() {
  return this.isSDK() ? 'SDK' : 'WL';
});

schema.method('getUrlPrefix', function() {
  if (this.isRootCompany()) {
    return this.carrierId ? '/a/' + this.carrierId : '/a';
  }

  if (this.reseller) {
    return '/r/' + this.carrierId;
  }

  return '/w/' + this.carrierId;
});

module.exports = mongoose.model(collectionName, schema);
