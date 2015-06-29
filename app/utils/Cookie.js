'use strict';

import cookie from 'cookie';
import env from './env';

/**
 * Custom cookie object for both client & server sides
 *
 * @param {object} options options for initialize the cookie
 * @param {object} [options.req] Express request object
 * @param {object} [options.res] Express response object
 * @param {number} [options.maxAge]
 */
function Cookie(options) {
  // not expired as default
  this._maxAge = options.maxAge || null;

  this._req = options.req;
  if (env.SERVER && !this._req) {
    throw new Error('Express `req` is a required option');
  }

  this._res = options.res;
  if (env.SERVER && !this._res) {
    throw new Error('Express `res` is a required option');
  }
}

/**
 * Accessor for the 'Max-Age' of cookie
 *
 * @return {number} number of seconds
 */
Cookie.prototype.maxAge = function() {
  return this._maxAge;
};

/**
 * get the cookie by name
 *
 * @param {string} name name of the cookie
 * @return {string|undefined}
 */
Cookie.prototype.get = function(name) {
  if (env.SERVER) {
    return this._req.cookies[name];
  }

  return cookie.parse(document.cookie)[name];
};

Cookie.prototype.set = function(name, value) {
  if (env.SERVER) {
    return this._res.cookie(name, value);
  }

  document.cookie = cookie.serialize(name, value, { maxAge: this.maxAge(), path: '/' });
};

Cookie.prototype.clear = function(name) {
  if (env.SERVER) {
    return this._res.clearCookie(name);
  }

  // noop for CLIENT
};

module.exports = Cookie;
