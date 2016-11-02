import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/resource');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function () {
  return {
    getCarrierResources(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/resource`)
        .accept('json')
        .end(genericHandler(cb));
    },
  };
}
