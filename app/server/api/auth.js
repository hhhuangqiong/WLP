import _ from 'lodash';
import superagent from 'superagent';

import { SIGN_IN, SIGN_OUT } from '../paths';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/auth');
const genericHandler = _.partial(saUtil.genericHandler, debug);

/**
 *
 * @param {String} [apiPrefix='']
 * @return {Object} function(s) to be mixed
 */
export default function (apiPrefix = '') {
  // NB: 'host' above is not used, need to defer evaluation via function to get the correct 'host'

  return {
    signIn(username, password, cb) {
      superagent
        .post(`${this._getHost()}${apiPrefix}${SIGN_IN}`)
        .accept('json')
        .send({ username, password })
        .end(genericHandler(cb));
    },

    signOut(cb) {
      superagent
      .get(`${this._getHost()}${apiPrefix}${SIGN_OUT}`)
      .accept('json')
      .end(genericHandler(cb));
    },
  };
}
