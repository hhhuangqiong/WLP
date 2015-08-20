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
    getCallsExport: function(params, cb) {
      superagent
        .get(`${this._getHost()}${exportPrefix}/${params.carrierId}/calls`)
        .query(params)
        .accept('json')
        .set('Authorization', this._getToken())
        .end(genericHandler(cb));
    },

    getCallsExportProgress: function(params, cb) {
      superagent
        .get(`${this._getHost()}${exportPrefix}/${params.carrierId}/calls/progress`)
        .query(params)
        .accept('json')
        .set('Authorization', this._getToken())
        .end(function(err, res) {
          if (err) {
            debug('error', err);
          }

          cb(err, res && res.body);
        });
    },

    getImExport: function(params, cb) {
      superagent
        .get(`${this._getHost()}${exportPrefix}/${params.carrierId}/im`)
        .query(params)
        .accept('json')
        .set('Authorization', this._getToken())
        .end(function(err, res) {
          if (err) {
            debug('error', err);
          }

          cb(err, res && res.body);
        });
    },

    getImExportProgress: function(params, cb) {
      superagent
        .get(`${this._getHost()}${exportPrefix}/${params.carrierId}/im/progress`)
        .query(params)
        .accept('json')
        .set('Authorization', this._getToken())
        .end(genericHandler(cb));
    }


  }
}
