import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/verification');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function () {
  return {
    // @TODO update the path to be RESTFUL
    getVerificationStatsByCountry(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/verificationStats`)
        .accept('json')
        .query(_.merge(params, { type: 'country' }))
        .end(genericHandler(cb));
    },
    getVerificationStatsByType(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/verificationStats`)
        .accept('json')
        .query(_.merge(params, { type: 'type' }))
        .end(genericHandler(cb));
    },
    getVerificationStatsByPlatform(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/verificationStats`)
        .accept('json')
        .query(_.merge(params, { type: 'platform' }))
        .end(genericHandler(cb));
    },
    getVerificationStatsByStatus(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/verificationStats`)
        .accept('json')
        .query(_.merge(params, { type: 'success' }))
        .end(genericHandler(cb));
    },
    getVerifications(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/verifications`)
        .accept('json')
        .query(params)
        .end(genericHandler(cb));
    },
  };
}
