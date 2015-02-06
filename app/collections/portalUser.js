var _         = require('lodash');
var bcrypt    = require('bcrypt');
var mongoose  = require('mongoose');
var randtoken = require('rand-token');
var speakeasy = require('speakeasy');

var util   = require('util');
var moment = require('moment');

var collectionName = 'PortalUser';

//TODO common validators to be shared among models
function lengthValidator(param, min, max) {
  return param.length >= min || param.length <= max;
}

//TODO use this validator or drop it
function emailValidator(email) {
  var reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return email && reg.test(email);
}
var portalUserSchema = new mongoose.Schema({
  isRoot: {
    type: Boolean,
    default: false
  },
  username: {
    // username is in form of email as discussed; TODO email validator integration
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  hashedPassword: {
    type: String
  },
  salt: {
    type: String
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
  // TODO convenince method to fetch token by event, e.g., tokenOf('signup')
  tokens: [{
    _id: false,
    event: String,
    value: mongoose.Schema.Types.Mixed,
    createAt: {
      type: Date,
      default: Date.now
    }
  }],
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
}, {
  collection: collectionName
});
portalUserSchema.virtual('password').get(function() {
  return this._password;
}).set(function(password) {
  this._password = password;
});
portalUserSchema.pre('save', function(next) {
  var user = this;
  if (user.hashedPassword)
    return next();
  // only when the caller submit data with password information
  if (user.password) {
    portalUserSchema.hashInfo(user.password, function(err, hash) {
      _.merge(user, hash);
    });
  }
  next();
});

/**
 * Apply the signup token value to the 'tokens' array
 *
 * @param {string|number|object} val
 * @return itself
 */
portalUserSchema.method('signUpToken', function(val) {
  const KEY = 'signup';
  var tokens = _.reject(this.tokens, (t) => { return t.event === KEY; });
  var token = {
    event: KEY,
    value: val || randtoken.generate(16),
    createAt: new Date()
  };
  tokens.push(token);
  this.tokens = token;
  return this;
});
portalUserSchema.method('hasCarrierDomain', function(carrierDomain) {
  return _.contains(this.carrierDomains, carrierDomain);
});
portalUserSchema.method('isValidPassword', function(password) {
  return bcrypt.compareSync(password, this.hashedPassword);
});

/**
 * Get the token of the event specified
 *
 * @param {String} event Event name
 * @return {Object|undefined} The event embedded document token itself or undefined
 */
portalUserSchema.method('tokenOf', function(event) {
  var found = _.filter(this.tokens, (t) => { return t.event === event});
  return _.first(found);
});

/**
 * Check if the evevnt token specified has expired
 *
 * @param {String} event The event type of the token
 * @param {Number} n The number to be used with the "unit"
 * @param {String} [unit] The unit for the "n" above; All values supported by momentjs (e.g., "days", "hours")
 *
 * @throws Will throw an error if no such token could be found
 *
 * @return {Boolean}
 */
portalUserSchema.method('isTokenExpired', function(event, n, unit) {
  var token = this.tokenOf(event);
  if(!token) throw new Error(util.format('No token of "%s"', event));

  var compareTo = moment().subtract(n, unit);
  return moment(token.createAt).isBefore(compareTo);
});

portalUserSchema.method('hasValidOneTimePassword', function(password) {
  // assume root user does not have 'googleAuth' property
  if (this.isRoot)
    return true;
  var secret = speakeasy.time({
    key: this.googleAuth,
    encoding: 'base32'
  });
  return password === secret;
});

portalUserSchema.static('newForgotPasswordRequest', function(username, cb) {
  this.findOneAndUpdate({
    username: username
  }, {
    $set: {
      token: {
        forgotPassword: {
          token: randtoken.generate(16),
          createAt: new Date(),
          expired: false
        }
      }
    }
  }, function(err, user) {
    if (err)
      return cb(err);
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
  bcrypt.hash(password, salt, function(err, hash) {
    if (err)
      return cb(err);
    cb(null, {
      salt: salt,
      hashedPassword: hash
    });
  });
};

// TODO may need to rewrite due to be compatible with 'signUpToken' above
portalUserSchema.static('newPortalUser', function(data, cb) {
  data.token = {};
  data.token.signUp = {
    token: randtoken.suid(22),
    expired: false
  };
  // always true?
  data.affiliatedCompany = 'M800-SUPER';
  this.create(data, function(err, user) {
    if (err)
      return cb(err);
    cb(null, user);
  });
});
module.exports = mongoose.model(collectionName, portalUserSchema);
