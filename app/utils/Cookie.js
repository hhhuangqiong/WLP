'use strict';

import cookie from 'cookie';

import {SERVER} from './env';

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
  if (SERVER && !this._req) {
    throw new Error('Express `req` is a required option');
  }

  this._res = options.res;
  if (SERVER && !this._res) {
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

  
  if (SERVER) {
    console.log('Server Cookie ', name, this._req.session.data[name]);
    return this._req.session.data[name];
  }

  console.log('Client Cookie ', cookie.parse(document.cookie)[name]);

  return cookie.parse(document.cookie)[name];
};

Cookie.prototype.set = function(name, value) {


  if (SERVER) {
    console.log('Service Cookie set', name, value);

     this._req.session.cookie[name] = value;

     this._req.session.save();

     return;
  }

  console.log('Client Cookie set', name, value);
  document.cookie = cookie.serialize(name, value, { maxAge: this.maxAge(), path: '/' });
};

Cookie.prototype.clear = function(name) {
  if (SERVER) {
    delete this._req.session.cookie[name];
  }

  // noop for CLIENT
};

module.exports = Cookie;
