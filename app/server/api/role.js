import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/roles');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function () {
  return {
    getRoles(params, cb) {
      superagent
        .get(`${this._getBaseUrl(params.carrierId)}/roles`)
        .accept('json')
        .end(genericHandler(cb));
    },

    createRole(params, cb) {
      const { carrierId, ...data } = params;
      superagent
        .post(`${this._getBaseUrl(carrierId)}/roles`)
        .accept('json')
        .send(data)
        .end(genericHandler(cb));
    },

    updateRole(params, cb) {
      const { carrierId, id, ...data } = params;
      superagent
        .put(`${this._getBaseUrl(carrierId)}/roles/${id}`)
        .accept('json')
        .send(data)
        .end(genericHandler(cb));
    },

    deleteRole(params, cb) {
      const { carrierId, id } = params;
      superagent
        .del(`${this._getBaseUrl(carrierId)}/roles/${id}`)
        .accept('json')
        .end(genericHandler(cb));
    },
  };
}
