import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/im');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function () {
  return {
    getImHistory(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/im`)
        .query(params)
        .accept('json')
        .end(genericHandler(cb));
    },
  };
}
