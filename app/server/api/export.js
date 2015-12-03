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
          if (err) {
            cb(err);
            debug('error', err);
            return;
          }

          cb(null, res && res.body);
        });
    },

    cancelExport(params, cb) {
      superagent
        .get(`${this._getHost()}${exportPrefix}/${params.carrierId}/cancel`)
        .query(params)
        .accept('json')
        .set('Authorization', this._getToken())
        .end((err, res) => {
          if (err) {
            cb(err);
            return;
          }

          try {
            cb(null, res.body.id);
          } catch (error) {
            cb(error);
          }
        });
    }
  }
}
