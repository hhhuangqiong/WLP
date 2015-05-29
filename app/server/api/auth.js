import superagent from 'superagent';

import { SIGN_IN, SIGN_OUT } from '../paths';

var debug = require('debug')('wlp:AuthApi');

/**
 * @param {String} [host='']
 * @param {String} [apiPrefix='']
 * @return {Object} function(s) to be mixed
 */
export default function(host = '', apiPrefix = '') {
  return {
    signIn: function(username, password, cb) {
      superagent
        .post(`${host}${apiPrefix}${SIGN_IN}`)
        .accept('json')
        .send({
          username: username,
          password: password
        })
        .end(function(err, res) {
          if (err) {
            debug('error', err);
          }
          if (!res.ok) {
            err = (res.body && res.body.error) || {
              status: res.status
            };
          }
          cb(err, res && res.body);
        });
    },

    signOut: function(cb) {
      superagent
        .post(`${host}${apiPrefix}${SIGN_OUT}`)
        .accept('json')
        //TODO explict declare this dep
        .set('Authorization', this._getToken())
        .end(function(err, res) {
          if (err) {
            debug('error', err);
          }
          cb(err, res && res.body);
        });
    }
  }
}

