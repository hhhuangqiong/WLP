import { pick, isString, get, extend, isNumber, defaults } from 'lodash';
import Q from 'q';
import request from 'superagent';
import logger from 'winston';
import { HttpStatusError } from 'common-errors';

const ALL_PERMISSIONS = ['create', 'update', 'read', 'delete'];
const ADMIN_PERMISSIONS = {
  company: ALL_PERMISSIONS,
  user: ALL_PERMISSIONS,
  permissions: ALL_PERMISSIONS,
  'wlp:endUser': ALL_PERMISSIONS,
  'wlp:topUp': ALL_PERMISSIONS,
  'wlp:generalOverview': ALL_PERMISSIONS,
  'wlp:vsfOverview': ALL_PERMISSIONS,
  'wlp:vsfDetails': ALL_PERMISSIONS,
  'wlp:callOverview': ALL_PERMISSIONS,
  'wlp:callDetails': ALL_PERMISSIONS,
  'wlp:imOverview': ALL_PERMISSIONS,
  'wlp:imDetails': ALL_PERMISSIONS,
  'wlp:smsOverview': ALL_PERMISSIONS,
  'wlp:smsDetails': ALL_PERMISSIONS,
};

export class IamServiceClientMock {
  getUserPermissions() {
    return Q.resolve(ADMIN_PERMISSIONS);
  }
}

export class IamServiceClient {
  constructor(options) {
    this._options = options;
    this._SERVICE_NAME = 'wlp';
  }
  getUserPermissions(params) {
    const query = pick(params, ['service', 'company']);
    const url = `${this._options.baseUrl}/access/users/${params.username}/permissions`;
    const req = request.get(url).query(query);
    return this._handle(req, url);
  }
  getRoles(query) {
    query = defaults(query, { service: this._SERVICE_NAME });
    const url = `${this._options.baseUrl}/access/roles`;
    const req = request.get(url).query(query);
    return this._handle(req, url);
  }
  createRole(role) {
    const url = `${this._options.baseUrl}/access/roles`;
    // Ensure service code is passed
    const body = extend({}, role, { service: this._SERVICE_NAME });
    const req = request.post(url).send(body);
    return this._handle(req, url);
  }
  updateRole(role) {
    const url = `${this._options.baseUrl}/access/roles/${role.id}`;
    // Ensure service code is passed
    const body = extend({}, role, { service: this._SERVICE_NAME });
    const req = request.put(url).send(body);
    return this._handle(req, url);
  }
  deleteRole(role) {
    const url = `${this._options.baseUrl}/access/roles/${role.id}`;
    // Ensure service code is passed
    const req = request.delete(url);
    return this._handle(req, url);
  }
  async _handle(superagentRequest, url) {
    try {
      const res = await superagentRequest;
      return res.body;
    } catch (err) {
      // Wrap HTTP errors
      if (isNumber(err.status)) {
        const errorBody = err.response.body;
        const errorMessages = ['message', 'error.message', 'msg']
          .map(x => get(errorBody, x))
          .filter(m => isString(m) && m.length > 0);
        const errorMessage = errorMessages[0] || '[Empty message]';
        const message = `Request to IAM (${url}) failed with ${err.status}. Message was: ${errorMessage}`;
        logger.error(message, err.response.body);
        const error = new HttpStatusError(err.status, message);
        error.response = errorBody;
        return Q.reject(error);
      }
      throw err;
    }
  }
}

export default IamServiceClient;
