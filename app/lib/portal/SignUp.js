import Q from 'q';

var _          = require('lodash');
var moment     = require('moment');
var util       = require('util');
var PortalUser = require('app/collections/portalUser');

/** @constant {string} */
export const SIGNUP_EVENT = 'signup';

// TODO signup-related logic
export class SignUp {

  /**
   * Clear the user sign up status (token)
   * Password will be set
   *
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
    return moment(after).isBefore(token.createAt);
  }

  // call the SpeakeasyWrapper#qrCode?
}

