import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/vsf');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function(apiPrefix = '') {
  const carrierBasePath = `${apiPrefix}/carriers`;

  return {
    getVSFTransactions(params, cb) {
      superagent
        .get(`${this._getHost()}${carrierBasePath}/${params.carrierId}/vsf`)
        .query(params)
        .accept('json')
        .set('Authorization', this._getToken())
        .end(genericHandler(cb));
    },

    getVSFWidgets(params, cb) {
      superagent
        .get(`${this._getHost()}${carrierBasePath}/${params.carrierId}/widgets/vsf`)
        .query(params)
        .accept('json')
        .set('Authorization', this._getToken())
        .end(genericHandler(cb));
    },
  };
}
