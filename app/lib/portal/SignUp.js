/**
 * @module portal/signup
 */
import Q from 'q';

var _          = require('lodash');
var moment     = require('moment');
var randtoken  = require('rand-token');
var util       = require('util');
var PortalUser = require('app/collections/portalUser');

var logger     = require('winston');

/**
 * Create a new SignUp service.
 *
 * @class
 */
export class SignUp {

  /**
   * @constructs
   * @param {TemplateMailer} mailer
   * @param {Object} opts
   * @param {string} opts.from  The "from" field for the sign up email
   * @param {string} opts.subject Sign up email subject
   */
  constructor(mailer, opts = {}) {
    // better to have mailer & template mailer implement the same interface
    if(!mailer) throw new Error('mailer is required for SignUp to work');
    this.mailer = mailer;

    if(!opts.from || !opts.subject) throw new Error('"from" & "subject" are both required in the options');
    this.opts = opts;
  }

  /**
   * This callback is the one from nodemailer#sendMail
   * @callback initializeUserCallback
   * @param {Object|null} err
   * @param {Object} info
   * @see {@link https://github.com/andris9/Nodemailer#sending-mail}
   */

  /**
   * Create new user with sign up token.
   * The user created is not ready to be used until afer verification.
   *
   * TODO
   * - detect if existing user (same email) exists
   *
   * @method initializeUser
   * @param {Object} userData data for user to be created
   * @param {string} createBy user id
   * @param {initializeUserCallback} cb
   */
  initializeUser(user, createBy, cb) {
    // TODO parameter validation

    // TODO verify if the creatBy user exists?
    user.set('createBy', createBy);

    // MAYBE factor out token generation logic
    user.addToken(SIGNUP_EVENT, randtoken.generate(16));

    user.save((err, model) => {
      if(err) return cb(err);

      var to = model.username;
      logger.debug(`About to send ${to} a 'signup' email`);

      // IDEA: method to get corresponding data from template
      this.mailer.send({to: to, from: this.opts.from, subject: this.opts.subject},
      // hard code various template data for now
        'test', {name: 'dummy'}, cb);
    });
  }

  /**
   * Clear the user sign up status (token)
   * Password will be set
   *
   * @method activate
   * @param {PortalUser} user
   * @param {string} password
   * @param {function} cb
   */
  activate(user, password, cb) {
    //TODO parameter validation

    user.removeToken(SIGNUP_EVENT);
    user.set('password', password);

    return Q.ninvoke(user, 'save').nodeify(cb);
  }

  /**
   * Verify if the username has a valid signup status/info
   *
   * @method verify
   * @param {PortalUser} user
   * @param {String} tokenValue
   * @param {Date} after The date which token should be created after
   *
   * @throws Will throw an error if the user passed doesn't have the token
   * @return {Boolean}
   */
  verify(user, tokenValue, after) {
    if(_.isEmpty(tokenValue)) throw new Error('Token value is required');
    if(!_.isDate(after)) throw new Error('Expect "after" to be passed as Date');

    // skeptical about using `instanceof`
    if(!(user instanceof PortalUser)) throw new Error('cannot only verify PortalUser data');

    var token = user.tokenOf(SIGNUP_EVENT);
    if(!token) throw new Error(util.format('no "%s" token found', SIGNUP_EVENT));
    if(token.value !== tokenValue) return false;

    // true means not expired
    return moment(after).isBefore(token.createdAt);
  }

  // call the SpeakeasyWrapper#qrCode?
}

/** @constant {string} */
export const SIGNUP_EVENT = 'signup';
