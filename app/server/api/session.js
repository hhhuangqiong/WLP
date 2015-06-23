import superagent from 'superagent';

import { SESSION } from '../paths';

var debug = require('debug')('wlp:SessionApi');

export default function(host = '', apiPrefix = '') {
  return {
    getSession: function(token, cb) {
      superagent
        .get(`${this._getHost()}${apiPrefix}${SESSION}`)
        .accept('json')
        .set('Authorization', token)
        .end(function(err, res) {
          if (err) {
            debug('error', err);
          }

          token = res && res.ok ? token : null;
          cb(err, token);
        });
    }
  }
}

