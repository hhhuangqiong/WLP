/// <reference path='../../typings/mongoose/mongoose.d.ts' />
/// <reference path='../../typings/underscore/underscore.d.ts' />
/// <reference path='../../typings/bcrypt/bcrypt.d.ts' />

import _        = require('underscore');
import bCrypt   = require('bcrypt');
import mongoose = require('mongoose');

var randtoken   = require('rand-token');
var speakeasy   = require('speakeasy');

//TODO common validators to be shared among models
function presenceValidator(param: string) {
  return param && param.length > 0;
}

function lengthValidator(param: string, min: number, max: number) {
  return param.length >= min || param.length <= max;
}
//TODO use this validator or drop it
function emailValidator(email: string): boolean {
  var reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return email && reg.test(email);
}

// TODO improve the schema definition
var portalUserSchema: mongoose.Schema = new mongoose.Schema({
  // username is in form of email as discussed; TODO email validator integration
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
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
    type: Object
  }],
  isVerified: {
    type: Boolean,
    require: true,
    default: false
  },
  status: {
    type: String,
    required: true,
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
    type: String
  },
  updateAt: {
    type: Date
  },
  updateBy: {
    type: String
  },
  affiliatedCompany: {
    type: String,
    required: true
  }
}, { collection: 'PortalUser' });

export interface PortalUser extends mongoose.Document {
  _id: string;
  username: string;
  hashedPassword: string;
  salt: string;
  name: Array<string>;
  changedPassword: Array<Array<() => string>>;
  carrierDomains: Array<string>;
  assignedGroup: Array<string>;
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

/*
 * Schema Pre State
 */

portalUserSchema.pre('save', function(next) {
  var user = this;

  console.log(user.isModified('hashedPassword'));
  if (!user.isModified('hashedPassword')) {
    return next();
  }

  bCrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);

    bCrypt.hash(user.hashedPassword, salt, function(err, hash) {
      if (err) return next(err);

      user.salt = salt;
      user.hashedPassword = hash;
      next();
    })
  });
});

/*
 * Schema Instance Methods
 */

portalUserSchema.method('hasCarrierDomain', function(carrierDomain: string) {
  return _.contains(this.carrierDomains, carrierDomain);
});

portalUserSchema.method('isValidPassword', function(password: string) {
  return bCrypt.compareSync(password, this.hashedPassword);
});

portalUserSchema.method('hasSignUpTokenExpired', function() {
  var now = new Date();
  console.log((now - this.token.signUp.token));
  return (now - this.token.signUp.token) > 3;
});

portalUserSchema.method('hasValidOneTimePassword', function(password:  string) {
  if (this.googleAuth == undefined) return true;

  var secret = speakeasy.time({
    key       : this.googleAuth,
    encoding  : 'base32'
  });

  return password == secret;
});

/*
 * Schema Static Methods
 */

export interface PortalUserModel extends mongoose.Model<PortalUser> {
  findByName(name: string, cb);
  newForgotPasswordRequest(username: string, cb);
  newPortalUser(data: PortalUser, cb);
}

portalUserSchema.static('findByName', function(name: string, cb: any) {
  this.find({ name: new RegExp(name, 'i') }, cb);
});

portalUserSchema.static('newForgotPasswordRequest', function(username: string, cb: Function) {

  var salt = bCrypt.genSaltSync(10);
  var token = bCrypt.hashSync(username + new Date(), salt);

  this.findOneAndUpdate({
    username: username
  }, {
    $set: {
      token: {
        forgotPassword: {
          token: token,
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

portalUserSchema.static('newPortalUser', function(data: PortalUser, cb) {
  var _this = this;
  var _cb = cb;

  bCrypt.genSalt(10, function(err, salt) {
    bCrypt.hash(data.username + new Date(), salt, function(err, hash) {
      // : any?
      data.salt = salt;
      data.hashedPassword = hash;
      data.token = {};
      data.token.signUp = {};
      data.token.signUp.token = randtoken.suid(22);
      data.token.signUp.expired = false;
      data.affiliatedCompany = 'M800-SUPER';

      _this.create(data, function(err, user) {
        if (err) {
          return _cb(err, null);
        }
        return _cb(null, user);
      })
    })
  });
});

module.exports = mongoose.model('PortalUser', portalUserSchema);
