/// <reference path='../../../typings/mongoose/mongoose.d.ts' />
/// <reference path='../../../typings/underscore/underscore.d.ts' />
/// <reference path='../../../typings/bcrypt/bcrypt.d.ts' />

import mongoose = require('mongoose');
import _ = require('underscore');
import bCrypt = require('bcrypt');

//TODO: common validators to be shared among models
function presenceValidator(param: string) {
  return param && param.length > 0;
}

function lengthValidator(param: string, min: number, max: number) {
  return param.length >= min || param.length <= max;
}

function emailValidator(email: string): boolean {
  var reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return email && reg.test(email);
}

var portalUserSchema: mongoose.Schema = new mongoose.Schema(
  {
    // username is in form of email as discussed
    username: {
      type: String,
      required: 'Username is required',
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
        required: 'First name is required'
      },
      last: {
        type: String,
        required: 'Last name is required'
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
    token: {
      forgotPassword: {
        token: {
          type: String
        },
        createAt: {
          type: Date
        }
      }
    },
    createAt: {
      type: Date,
      required: true
    },
    createBy: {
      type: String,
      required: true
    },
    updateAt: {
      type: Date,
      required: true
    },
    updateBy: {
      type: String,
      required: true
    },
    affiliatedCompany:{
      type:String,
      required:true
    }
  }, { collection: 'portalUser'}
);

export interface PortalUser extends mongoose.Document {
  _id: string;
  username: string;
  hashedPassword: string;
  name: Array<string>;
  changedPassword: Array<Array<() => string>>;
  carrierDomains: Array<string>;
  assignedGroup: Array<string>;
  isVerified: boolean;
  status: string;
  createAt: string;
  createBy: string;
  updateAt: string;
  updateBy: string;

  hasCarrierDomain(carrierDomain: string): Boolean;
  isValidPassword(password: string): Boolean;
}

/*
 * Schema Instance Methods
 */

portalUserSchema.method('hasCarrierDomain', function(carrierDomain: string) {
  return _.contains(this.carrierDomains, carrierDomain);
});

portalUserSchema.method('isValidPassword', function(password: string) {
  return bCrypt.compareSync(password, this.hashedPassword);
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
          createAt: new Date()
        }
      }
    }
  }, function(err, user) {

    if (err) {
      cb(err, null);
    }

    cb(null, user);
  });
});

portalUserSchema.static('newPortalUser', function(data: PortalUser, cb) {

  var _this = this;
  var _cb = cb;

  bCrypt.genSalt(10, function(err, salt) {
    bCrypt.hash(data.username + new Date(), salt, function(err, hash) {
      data.salt = salt;
      data.hashedPassword = hash;

      _this.create(data, function(err, user) {
        if (err) {
          return _cb(err, null);
        }
        return _cb(null, user);
      })
    })
  });
});

var PortalUser = module.exports = <PortalUserModel>mongoose.model('PortalUser', portalUserSchema);
