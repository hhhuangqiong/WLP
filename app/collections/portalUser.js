var _         = require('lodash');
var bcrypt    = require('bcrypt');
var moment    = require('moment');
var mongoose  = require('mongoose');
var randtoken = require('rand-token');
var speakeasy = require('speakeasy');

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

/**
 * @class PortalUserSchema
 */
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
  affiliatedCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  assignedGroup: {
    type: String
  },
  status: {
    type: String,
    // TODO introduce enum-like statuses
    default: 'inactive'
  },
  // Goolge Authenticator
  googleAuth: {
    key: String,
    encoding: String,
    //TODO enforce valid url
    qrCodeUrl: String
  },
  // TODO convenince method to fetch token by event, e.g., tokenOf('signup')
  tokens: [{
    _id: false,
    event: String,
    value: mongoose.Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  createBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: collectionName
  },
  updateAt: {
    type: Date
  },
  updateBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: collectionName
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
  if (this.hashedPassword && !this.password)
    return next();

  if (this.password) {
    this.constructor.hashInfo(this.password, (err, hash) => {
      _.merge(this, hash);
    });
  }
  next();
});

/**
 * Add token of the event with value to 'tokens'
 * Assume each event can have 1 and only 1 token
 *
 * @param {string|number|object} [val]
 * @returns {PortalUser}
 */
portalUserSchema.method('addToken', function(event, val) {
  this.removeToken(event);
  this.tokens.push(this.constructor.makeToken(event, val));
  return this;
});

/**
 * Remove token of the event
 *
 * @param {string} event
 * @returns {PortalUser}
 */
portalUserSchema.method('removeToken', function(event) {
  var tokens = _.reject(this.tokens, (t) => { return t.event === event; });
  this.tokens = tokens;
  return this;
});

/**
 * Set the Google Authenticator information
 *
 * Google Authentiator only support 'base32'?
 *
 * @param {String} [name] show up as the label after scanning
 * @param {Number} [length=32] length of the generated secret key
 * @return this
 */
portalUserSchema.method('googleAuthInfo', function(name = '', length = 32) {
  var result = speakeasy.generate_key({lenght: length, google_auth_qr: true, name: name});
  return this.set('googleAuth', { key: result.base32, encoding: 'base32', qrCodeUrl: result.google_auth_qr });
});

/**
 * Produce the token in the conformed format
 *
 * @method makeToken
 * @static
 * @return {Object} the token
 */
portalUserSchema.static('makeToken', function(event, val) {
  return {
    event: event,
    value: val || randtoken.generate(16),
    createdAt: new Date()
  };
});

portalUserSchema.method('isValidPassword', function(password) {
  return bcrypt.compareSync(password, this.hashedPassword);
});

/**
 * Get the token of the event specified
 *
 * @method tokenOf
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
 * @method isTokenExpired
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
  if(!token) throw new Error(`No token of "${event}"`);

  var compareTo = moment().subtract(n, unit);
  return moment(token.createdAt).isBefore(compareTo);
});

portalUserSchema.method('hasValidOneTimePassword', function(number) {
  // assume root user does not need 'googleAuth'
  //if (this.isRoot) return true;
  return true;

  var googleAuth = this.get('googleAuth') || {};
  return number === speakeasy.time({ key: googleAuth.key, encoding: googleAuth.encoding });
});

/**
 * Hash the password with generated salt returned
 *
 * @method hashInfo
 * @param {String} password
 * @param {Function} cb
 */
portalUserSchema.static('hashInfo', function(password, cb) {
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
})

/**
 * Produce the token in the conformed format
 *
 * @method makeToken
 * @return {Object} the token
 */
portalUserSchema.static('makeToken', function(event, val) {
  return {
    event: event,
    value: val || randtoken.generate(16),
    createdAt: new Date()
  };
});

// TODO
// - make use of existing token features
// - consider the approach of 'newForgotPasswordRequest'
portalUserSchema.static('newPortalUser', function(data, cb) {
  var token = this.makeToken('signup');

  data.tokens = data.tokens || [];
  data.tokens.push(token);

  // always true?
  data.affiliatedCompany = 'M800-SUPER';

  this.create(data, (err, user) => {
    if (err) return cb(err);
    cb(null, user);
  });
});

portalUserSchema.static('newForgotPasswordRequest', function(username, cb) {
  var token = this.makeToken('forgotPassword');

  this.findOneAndUpdate({
    username: username
  }, {
    // this kinda make '#addToken' redundant
    $addToSet: { tokens: token }
  }, function(err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
});

module.exports = mongoose.model(collectionName, portalUserSchema);
