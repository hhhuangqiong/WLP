var mongoose = require('mongoose');
var collectionName = 'Company';
var schema = new mongoose.Schema({
  parentCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  logo: {
    type: String
  },
  serviceType: {
    type: String
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String
  },
  categoryID: {
    type: String
  },
  country: {
    type: String
  },
  timezone: {
    type: String
  },
  accountManager: {
    type: String,
    required: true
  },
  billCode: {
    type: String
  },
  // reflecting company type, either "Default" or "Reseller"
  reseller: {
    type: Boolean
  },
  carrierId: {
    type: String,
    unique: true
  },
  domain: {
    type: String,
    unique: true
  },
  businessContact: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  technicalContact: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  supportContact: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  themeType: {
    type: String
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
  },
  supportedLanguages: {
    type: String,
    required: true
  },
  supportedDevices: {
    type: String,
    required: true
  }
}, { collection: collectionName });
module.exports = mongoose.model(collectionName, schema);
