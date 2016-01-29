import Q from 'q';
import mongoose from 'mongoose';

import gridfs from './../server/utils/gridfs';

const collectionName = 'Company';
const ROOT_COMPANY_CARRIER_ID = 'm800';
const SDK_DOMAIN = '.m800-api.com';

const schema = new mongoose.Schema({
  parentCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  carrierId: {
    type: String,
    unique: true,
  },

  // reflecting Company Type, either "Default" or "Reseller"
  reseller: {
    type: Boolean,
  },
  logo: {
    type: mongoose.Schema.Types.ObjectId,
  },
  themeType: {
    type: String,
  },
  address: {
    type: String,
  },
  categoryID: {
    type: String,
  },
  country: {
    type: String,
    required: true,
  },
  timezone: {
    type: String,
    required: true,
  },
  accountManager: {
    type: String,
  },
  billCode: {
    type: String,
  },
  expectedServiceDate: {
    type: Date,
  },
  contractNumber: {
    type: String,
  },
  referenceNumber: {
    type: String,
  },
  features: {
    type: Object,
    default: [],
  },
  businessContact: {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  technicalContact: {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  supportContact: {
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
  },
  widgets: {
    overview: [],
    stores: [],
    calls: [],
    im: [],
    sms: [],
    vsf: [],
  },
  serviceConfig: {
    developerKey: {
      type: String,
    },
    developerSecret: {
      type: String,
    },
    applicationId: {
      type: String,
    },
    applications: {
      ios: {
        name: {
          type: String,
          default: null,
        },
      },
      android: {
        name: {
          type: String,
          default: null,
        },
      },
    },
  },
  status: {
    type: String,
    required: true,
    default: 'inactive',
  },
  capabilities: {
    type: Array,
    default: [],
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  createBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PortalUser',
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
  updateBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PortalUser',
  },
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
    if (err) throw err;

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
    if (err) throw err;

    return cb(null, { carrierId: company.carrierId, status: company.status });
  });
});

schema.method('isRootCompany', function() {
  return this.carrierId === ROOT_COMPANY_CARRIER_ID;
});

schema.method('getCompanyType', function() {
  if (this.isRootCompany()) {
    return ROOT_COMPANY_CARRIER_ID;
  } else if (this.reseller) {
    return 'reseller';
  } else if (this.isSDK()) {
    return 'sdk';
  }

  return 'wl';
});

/**
 * @method isValidCarrier
 * Check if the carrierId input match with existing companies
 *
 * @param carrierId
 */
schema.static('isValidCarrier', function(carrierId) {
  return new Promise((resolve, reject) => {
    this.findOne({ carrierId }, (err, doc) => {
      if (err) return reject(err);
      resolve(!!doc);
    });
  });
});

/**
 * @method getManagingCompany
 * Get one company by passing parentCarrierId to find the managing one
 *
 * @param {String} parentCarrierId
 * @param {Function} cb
 */
schema.static('getManagingCompany', function(parentCarrierId, cb) {
  return Q.ninvoke(this, 'findOne', { _id: parentCarrierId })
    .then((company) => {
      if (!company) {
        throw new Error({
          name: 'NotFound',
          message: 'parent company does not exist',
        });
      }

      // By default, finding only children companies
      let criteria = { parentCompany: company._id };

      // if the parent company is either m800 or maaii
      // finding all existing companies except m800
      if (company.isRootCompany()) {
        criteria = { carrierId: { $ne: ROOT_COMPANY_CARRIER_ID } };
      }

      return Q.ninvoke(this, 'find', criteria)
        .catch((err) => {
          throw err;
        });
    })
    .then((companies) => {
      return cb(null, companies);
    })
    .catch((err) => {
      return cb(err);
    });
});

/**
 * Returns the company which is having the specified carrierId.
 *
 * @method getCompanyByCarrierId
 * @static
 * @param {String} carrierId  The carrierId of the company
 * @param {Function} cb  The node-style callback to be called when the process is done
 */
schema.static('getCompanyByCarrierId', function getCompanyByCarrierId(carrierId, cb) {
  /* Alternative way beside using callback */
  if (!cb) {
    return new Promise((resolve, reject) => {
      this.findOne({ carrierId }, (err, doc) => {
        if (err) return reject(new Error(`Encounter error in getCompanyByCarrierId function with carrierId ${carrierId}`));
        resolve(doc);
      });
    });
  }

  /* Make most of the current usage to be compatible */
  Q.ninvoke(this, 'findOne', { carrierId: carrierId })
    .then((company) => {
      if (!company) {
        throw new Error({ name: 'NotFound', message: `Company with carrierId=${carrierId} does not exist` });
      }

      cb(null, company);
    })
    .catch(cb)
    .done();
});

/**
 * Returns the ID of the company of the root user.
 *
 * @method getRootCompanyId
 * @param {Function} cb  The node-style callback to be called when the process is done
 */
schema.static('getRootCompanyId', function(cb) {
  this.getCompanyByCarrierId(ROOT_COMPANY_CARRIER_ID, (err, company) => {
    if (err) {
      cb(err);
      return;
    }

    cb(null, company.id);
  });
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
