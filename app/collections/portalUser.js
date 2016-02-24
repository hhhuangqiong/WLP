import _ from 'lodash';
import bcrypt from 'bcrypt';
import moment from 'moment';
import mongoose from 'mongoose';
import randtoken from 'rand-token';
import speakeasy from 'speakeasy';

import Company from './company';

const COLLECTION_NAME = 'PortalUser';

import {
  MongoDBError,
  NotFoundError,
} from 'common-errors';

/**
 * @class PortalUserSchema
 */
const portalUserSchema = new mongoose.Schema({
  isRoot: { type: Boolean, default: false },
  username: {
    // username is in form of email as discussed; TODO email validator integration
    type: String, required: true, trim: true, unique: true,
  },
  hashedPassword: { type: String },
  salt: { type: String },
  name: {
    first: { type: String, required: true, trim: true },
    last: { type: String, required: true, trim: true },
  },
  affiliatedCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  assignedGroup: { type: String },
  assignedCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
  // Goolge Authenticator
  googleAuth: { key: String, encoding: String,
    // TODO: enforce valid url
    qrCodeUrl: String,
  },
  // TODO: convenince method to fetch token by event, e.g., tokenOf('signup')
  tokens: [{
    _id: false,
    event: String,
    value: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
  createBy: { type: mongoose.Schema.Types.ObjectId, ref: COLLECTION_NAME },
  updateAt: { type: Date },
  updateBy: { type: mongoose.Schema.Types.ObjectId, ref: COLLECTION_NAME },
}, {
  collection: COLLECTION_NAME,
});

portalUserSchema.virtual('password').get(function getPassword() {
  return this._password;
}).set(function setPassword(password) {
  this._password = password;
});

portalUserSchema.virtual('email').get(function getEmail() {
  return this.username;
}).set(function setEmail(email) {
  this._email = email;
});

portalUserSchema.virtual('displayName').get(function getDisplayName() {
  return this.name.first + ' ' + this.name.last;
});

portalUserSchema.pre('save', function preSave(next) {
  if (this.hashedPassword && !this.password) {
    return next();
  }

  if (this.password) {
    const hashPasswordCb = (err, hashResult) => {
      this.salt = hashResult.salt;
      this.hashedPassword = hashResult.hashedPassword;
      next();
    };

    this.constructor.hashInfo(this.password, hashPasswordCb);
    return null;
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
portalUserSchema.method('addToken', function addToken(event, val) {
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
portalUserSchema.method('removeToken', function removeToken(event) {
  const tokens = _.reject(this.tokens, t => t.event === event);
  this.tokens = tokens;
  return this;
});

/**
 * Add password for user when does not have password
 *
 * @param {string} password
 * @returns {PortalUser}
 */
portalUserSchema.method('addPassword', function addPassword(password) {
  this.password = password;
  return this;
});

/**
 * Get the company instance of current user
 *
 * @method makeToken
 * @return {Model} Company
 */
portalUserSchema.method('getCompany', function getCompany() {
  return new Promise((resolve, reject) => {
    Company.findOne({ _id: this.affiliatedCompany }, (err, doc) => {
      if (err) {
        return reject(new MongoDBError(`Fail to find company with id ${this.affiliatedCompany}`, err));
      }

      if (!doc) {
        return reject(new NotFoundError(`Fail to find company ${this.affiliatedCompany}`));
      }

      resolve(doc);
    });
  });
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
portalUserSchema.method('googleAuthInfo', function googleAuthInfo(name = '', length = 32) {
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  const result = speakeasy.generate_key({ lenght: length, google_auth_qr: true, name: name });
  return this.set('googleAuth', { key: result.base32, encoding: 'base32', qrCodeUrl: result.google_auth_qr });
});

/**
 * Produce the token in the conformed format
 *
 * @method makeToken
 * @static
 * @return {Object} the token
 */
portalUserSchema.static('makeToken', function makeToken(event, val) {
  return {
    event: event,
    value: val || randtoken.generate(16),
    createdAt: new Date(),
  };
});

portalUserSchema.method('isValidPassword', function isValidPassword(password) {
  return bcrypt.compareSync(password, this.hashedPassword);
});

/**
 * Get the token of the event specified
 *
 * @method tokenOf
 * @param {String} event Event name
 * @return {Object|undefined} The event embedded document token itself or undefined
 */
portalUserSchema.method('tokenOf', function tokenOf(event) {
  const found = _.filter(this.tokens, t => t.event === event);
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
portalUserSchema.method('isTokenExpired', function isTokenExpired(event, n, unit) {
  const token = this.tokenOf(event);

  if (!token) {
    throw new Error(`No token of "${event}"`);
  }

  const compareTo = moment().subtract(n, unit);
  return moment(token.createdAt).isBefore(compareTo);
});

portalUserSchema.method('hasValidOneTimePassword', function hasValidOneTimePassword(number) {
  // assume root user does not need 'googleAuth'
  if (this.isRoot) {
    return true;
  }

  const googleAuth = this.get('googleAuth') || {};
  return number === speakeasy.time({ key: googleAuth.key, encoding: googleAuth.encoding });
});

/**
 * Validate carrierId with all accessable companies for current user
 *
 * @method validateCarrier
 * @param {String} carrierId
 */
portalUserSchema.method('validateCarrier', function validateCarrier(carrierId) {
  return new Promise((resolve, reject) => {
    this.getCompany()
      .then(company => {
        if (!company) {
          return resolve(false);
        }

        if (company.carrierId === carrierId) {
          return resolve(true);
        }

        Company.getManagingCompany(company.carrierId, (err, companies) => {
          return resolve(companies.find(managingCompany => managingCompany.carrierId === carrierId));
        });
      })
      .catch(error => reject(error));
  });
});

/**
 * Hash the password with generated salt returned
 *
 * @method hashInfo
 * @param {String} password
 * @param {Function} cb
 */
portalUserSchema.static('hashInfo', function hashInfo(password, cb) {
  // use default rounds for now
  const salt = bcrypt.genSaltSync(10);

  bcrypt.hash(password, salt, function afterHash(err, hash) {
    if (err) {
      return cb(err);
    }

    cb(null, {
      salt: salt,
      hashedPassword: hash,
    });
  });
});

/**
 * Produce the token in the conformed format
 *
 * @method makeToken
 * @return {Object} the token
 */
portalUserSchema.static('makeToken', function makeToken(event, val) {
  return {
    event: event,
    value: val || randtoken.generate(16),
    createdAt: new Date(),
  };
});

// TODO
// - make use of existing token features
// - consider the approach of 'newForgotPasswordRequest'
portalUserSchema.static('newPortalUser', function newPortalUser(data, cb) {
  const token = this.makeToken('signup');

  data.tokens = data.tokens || [];
  data.tokens.push(token);

  this.create(data, (err, user) => {
    if (err) {
      return cb(err);
    }

    cb(null, user);
  });
});

portalUserSchema.static('findByEmail', function findByEmail(email) {
  return new Promise((resolve, reject) => {
    this.findOne({ username: email }, (err, user) => {
      if (err) {
        return reject(new MongoDBError(`Encounter error when finding user ${email}`, err));
      }

      if (!user) {
        return reject(new NotFoundError(`Cannot find user with email: ${email}`));
      }

      resolve(user);
    });
  });
});

portalUserSchema.static('newForgotPasswordRequest', function newForgotPasswordRequest(username, cb) {
  const token = this.makeToken('forgotPassword');

  this.findOneAndUpdate({
    username: username,
  }, {
    // this kinda make '#addToken' redundant
    $addToSet: { tokens: token },
  }, (err, user) => {
    if (err) {
      return cb(err);
    }

    cb(null, user);
  });
});

module.exports = mongoose.model(COLLECTION_NAME, portalUserSchema);
