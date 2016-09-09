import _ from 'lodash';
import superagent from 'superagent';
import * as saUtil from '../../utils/superagent';

const debug = require('debug')('app:server/api/roles');
const genericHandler = _.partial(saUtil.genericHandler, debug);

export default function (apiPrefix = '') {
  return {
    getRoles(params, cb) {
      superagent
        .get(`${this._getHost()}${apiPrefix}/roles`)
        .query({ carrierId: this.getCarrierId(), ...params })
        .accept('json')
        .end(genericHandler(cb));
    },

    createRole(params, cb) {
      superagent
        .post(`${this._getHost()}${apiPrefix}/roles`)
        .accept('json')
        .query({ carrierId: this.getCarrierId() })
        .send(params)
        .end(genericHandler(cb));
    },

    updateRole(params, cb) {
      superagent
        .put(`${this._getHost()}${apiPrefix}/roles/${params.id}`)
        .accept('json')
        .query({ carrierId: this.getCarrierId() })
        .send(params)
        .end(genericHandler(cb));
    },

    deleteRole(params, cb) {
      superagent
        .del(`${this._getHost()}${apiPrefix}/roles/${params.id}`)
        .query({ carrierId: this.getCarrierId() })
        .accept('json')
        .end(genericHandler(cb));
    },
  };
}
