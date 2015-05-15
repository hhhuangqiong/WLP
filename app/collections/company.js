var mongoose = require('mongoose');
var collectionName = 'Company';
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
  // reflecting company type, either "Default" or "Reseller"
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
  customerType: {
    type: String
  },
  contactNumber: {
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
    im: []
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

schema.method('isRootCompany', function() {
  return !this.parentCompany;
});

schema.method('getServiceType', function() {
  // regex pattern or indexOf?
  return this.carrierId.indexOf('.maaii.com') > -1 ? 'WL' : 'SDK';
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
