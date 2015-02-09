var moment     = require('moment');
var util       = require('util');
var PortalUser = require('app/collections/portalUser');

// TODO consider export the constant(s)
const SIGNUP_EVENT = 'signup';

export default class SignUp {

  /**
   * Verify if the username has a valid signup status/info
   *
   * TODO Throw Error if the user does not possess the token
   *
   * @param {PortalUser} user
   * @param {String} tokenValue
   * @param {Date} after The date which token should be created after
   *
   */
  verify(user, tokenValue, after) {
    var token = user.tokenOf(SIGNUP_EVENT);
    if(!token) throw new Error(util.format('no "%s" token found', SIGNUP_EVENT));
    if(token.value !== tokenValue) return false;

    // true means not expired
    return moment(after).isBefore(token.createAt);
  }

}

