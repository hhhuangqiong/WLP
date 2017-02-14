import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/accounts');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function () {
  return {
    getProvision(params, cb) {
      const { carrierId, provisionId } = params;
      superagent
        .get(`${this._getBaseUrl(carrierId)}/provisioning/${provisionId}`)
        .accept('json')
        .end(genericHandler(cb));
    },
    updateProvision(params, cb) {
      const { carrierId, provisionId, ...restCompanyInfo } = params;
      superagent
        .put(`${this._getBaseUrl(carrierId)}/provisioning/${provisionId}`)
        .set('Content-Type', 'application/json')
        .send(restCompanyInfo)
        .accept('json')
        .end(genericHandler(cb));
    },
    getProvisions(params, cb) {
      const { carrierId, ...query } = params;
      superagent
        .get(`${this._getBaseUrl(carrierId)}/provisioning/`)
        .query(query)
        .accept('json')
        .end(genericHandler(cb));
    },
    createProvision(params, cb) {
      const { carrierId, logo, ...provisionInfo } = params;
      const formData = new FormData();
      if (logo) {
        formData.append('logo', logo);
      }
      formData.append('data', JSON.stringify(provisionInfo));
      superagent
        .post(`${this._getBaseUrl(carrierId)}/provisioning`)
        .send(formData)
        .end(genericHandler(cb));
    },
  };
}
