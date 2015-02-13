var _          = require('lodash');
var moment     = require('moment');
var util       = require('util');
var PortalUser = require('app/collections/portalUser');

// TODO consider export the constant(s)
const SIGNUP_EVENT = 'signup';

// TODO signup-related logic, add token (interface)
export default class SignUp {
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

  // remove the 'signup' token
  // update the user (updateBy?)
  // call the SpeakeasyWrapper#qrCode
}

