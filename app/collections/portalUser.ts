/// <reference path='../../typings/mongoose/mongoose.d.ts' />
/// <reference path='../../typings/bcrypt/bcrypt.d.ts' />

import _        = require('lodash');
import bcrypt   = require('bcrypt');
import mongoose = require('mongoose');

var randtoken   = require('rand-token');
var speakeasy   = require('speakeasy');

var collectionName = 'PortalUser';

//TODO common validators to be shared among models
function lengthValidator(param: string, min: number, max: number) {
  return param.length >= min || param.length <= max;
}
//TODO use this validator or drop it
function emailValidator(email: string): boolean {
  var reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return email && reg.test(email);
}

var portalUserSchema: mongoose.Schema = new mongoose.Schema({
  isRoot: { type: Boolean, default: false },
  username: {
    // username is in form of email as discussed; TODO email validator integration
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  hashedPassword: { type: String },
  salt: { type: String },
  name: {
    first: {
      type: String,
      required: true,
      trim: true
    },
    last: {
      type: String,
      required: true,
      trim: true
    }
  },
  changedPassword: [{
    password: {
      type: String
    },
    changeAt: {
      type: Date
    }
  }],
  carrierDomains: [{
    type: String
  }],
  assignedGroups: [{
    type: String
  }],
  isVerified: {
    type: Boolean,
    require: true,
    default: false
  },
  status: {
    type: String,
    // TODO introduce enum-like statuses
    default: 'inactive'
  },
  googleAuth: {
    type: String
  },
  token: {
    signUp: {
      token: {
        type: String
      },
      createAt: {
        type: Date,
        default: new Date()
      },
      expired: {
        type: Boolean,
        default: true
      }
    },
    forgotPassword: {
      token: {
        type: String
      },
      createAt: {
        type: Date,
        default: new Date()
      },
      expired: {
        type: Boolean,
        default: true
      }
    }
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
    type: Date
  },
  updateBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PortalUser'
  },
  affiliatedCompany: {
    type: String,
    required: true
  }
}, { collection: collectionName });

export interface PortalUser extends mongoose.Document {
  _id: string;
  username: string;
  hashedPassword: string;
  salt: string;
  name: Array<string>;
  changedPassword: Array<Array<() => string>>;
  carrierDomains: Array<string>;
  assignedGroups: Array<string>;
  isVerified: boolean;
  status: string;
  googleAuth: string;
  token: {
    signUp: {
      token: string;
      createAt: string;
      expired: boolean;
    };
    forgotPassword: {
      token: string;
      createAt: string;
      expired: boolean;
    };
  };
  createAt: string;
  createBy: string;
  updateAt: string;
  updateBy: string;
  affiliatedCompany: string;

  hasCarrierDomain(carrierDomain: string): Boolean;
  isValidPassword(password: string): Boolean;
  hasSignUpTokenExpired(): Boolean;
  hasValidOneTimePassword(password: string): Boolean;
}

portalUserSchema.virtual('password')
  .get(function() { return this._password; })
  .set(function(password) { this._password = password; });

portalUserSchema.pre('save', function(next) {
  var user = this;
  if(user.hashedPassword) return next();

  // only when the caller submit data with password information
  if(user.password) {
    portalUserSchema.hashInfo(user.password, function(err, hash){
      _.merge(user, hash)
      next();
    });
  }
});

/**
 * Schema Instance Methods
 */
portalUserSchema.method('hasCarrierDomain', function(carrierDomain: string) {
  return _.contains(this.carrierDomains, carrierDomain);
});

portalUserSchema.method('isValidPassword', function(password: string) {
  return bcrypt.compareSync(password, this.hashedPassword);
});

// TODO verify the expiration logic
portalUserSchema.method('hasSignUpTokenExpired', function() {
  var now = new Date();
  console.log((now - this.token.signUp.token));
  return (now - this.token.signUp.token) > 3;
});

portalUserSchema.method('hasValidOneTimePassword', function(password:  string) {
  // assume root user does not have 'googleAuth' property
  if (this.isRoot) return true;

  var secret = speakeasy.time({
    key       : this.googleAuth,
    encoding  : 'base32'
  });

  return password == secret;
});

/**
 * Schema Static Methods
 */
export interface PortalUserModel extends mongoose.Model<PortalUser> {
  findByName(name: string, cb);
  newForgotPasswordRequest(username: string, cb);
  newPortalUser(data: PortalUser, cb);
}

//TODO obsolete this method
portalUserSchema.static('findByName', function(name: string, cb: any) {
  this.find({ name: new RegExp(name, 'i') }, cb);
});

portalUserSchema.static('newForgotPasswordRequest', function(username: string, cb: Function) {
  this.findOneAndUpdate({
    username: username
  }, {
    $set: {
      token: {
        forgotPassword: {
          token: randtoken.generate(16), // use a simple one for now
          createAt: new Date(),
          expired: false
        }
      }
    }
  }, function(err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
});

/**
 * Hash the password with generated salt returned
 *
 * @param {String} password
 * @param {Function} cb
 */
portalUserSchema.statics.hashInfo = function(password, cb) {
  //use default rounds for now
  var salt = bcrypt.genSaltSync(10);
  console.log('hashInfo', password, salt);
  bcrypt.hash(password, salt, function(err, hash) {
    if(err) return cb(err);
    cb(null, {salt: salt, hashedPassword: hash});
  });
}

portalUserSchema.static('newPortalUser', function(data, cb) {
  data.token = {};
  data.token.signUp = {
    token   : randtoken.suid(22),
    expired : false
  };
  // always true?
  data.affiliatedCompany = 'M800-SUPER';

  this.create(data, function(err, user) {
    if (err) return cb(err, null);
    cb(null, user);
  });
});

module.exports = mongoose.model(collectionName, portalUserSchema);
