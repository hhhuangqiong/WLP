import _ from 'lodash';
import superagent from 'superagent';

import * as saUtil from '../../utils/superagent';

let debug = require('debug')('app:server/api/export');
let genericHandler = _.partial(saUtil.genericHandler, debug);

/**
 * List of routes regarding file export
 *
 * @param {string} exportPrefix - URI prefix for export only request, it must include a slash if it is not empty.
 */
export default function(exportPrefix='') {
  return {
    getExport(params, cb) {
      superagent
        .get(`${this._getHost()}${exportPrefix}/${params.carrierId}`)
        .query(params)
        .accept('json')
        .set('Authorization', this._getToken())
        .end(genericHandler(cb));
    },

    getExportProgress(params, cb) {
      superagent
        .get(`${this._getHost()}${exportPrefix}/${params.carrierId}/progress`)
        .query(params)
        .accept('json')
        .set('Authorization', this._getToken())
        .end((err, res) => {
          if (err) debug('error', err);

          cb(err, res && res.body);
        });
    }
  }
}
