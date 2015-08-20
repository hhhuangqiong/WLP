import _ from 'lodash';
import superagent from 'superagent';

import * as saUtil from '../../utils/superagent';
import { SESSION } from '../paths';

let debug = require('debug')('app:server/api/session');
let genericHandler = _.partial(saUtil.genericHandler, debug);

export default function(apiPrefix = '') {
  return {
    getSession: function(token, cb) {
      superagent
        .get(`${this._getHost()}${apiPrefix}${SESSION}`)
        .accept('json')
        .set('Authorization', token)
        .end(genericHandler(cb));
    }
  }
}

