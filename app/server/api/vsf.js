import superagent from 'superagent';
import { SESSION } from '../paths';

const debug = require('debug')('src:server/api/vsfApi');

export default function(apiPrefix = '') {
  const carrierBasePath = `${apiPrefix}/carriers`;

  return {
    getVSFTransactions(params, cb) {
      console.info('`${this._getHost()}${carrierBasePath}/${params.carrierId}/vsf`', `${this._getHost()}${carrierBasePath}/${params.carrierId}/vsf`)
      superagent
        .get(`${this._getHost()}${carrierBasePath}/${params.carrierId}/vsf`)
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

    getfetchVSFWidgets(params, cb) {
      superagent
        .get(`${this._getHost()}${carrierBasePath}/${params.carrierId}/widgets/vsf`)
        .query(params)
        .accept('json')
        .set('Authorization', this._getToken())
        .query({ userId: this._getUserId() })
        .end(function(err, res) {
          if (err) {
            debug('error', err);
          }

          cb(err, res && res.body);
        });
    }
  }
}
