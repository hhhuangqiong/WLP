import _ from 'lodash';
import superagent from 'superagent';

import * as saUtil from '../../utils/superagent';
import { SESSION } from '../paths';

let debug = require('debug')('app:server/api/session');

export default function(apiPrefix = '') {
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
  };
}

