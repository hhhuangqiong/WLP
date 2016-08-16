import { pick, isString, get, extend, isNumber, defaults, omit } from 'lodash';
import Q from 'q';
import request from 'superagent';
import logger from 'winston';
import { HttpStatusError } from 'common-errors';
import nconf from 'nconf';

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
    this.userPath = `${this._options.baseUrl}/identity/users`;
    this.companyPath = `${this._options.baseUrl}/identity/companies`;
  }

  // users
  getUsers(query) {
    const url = this.userPath;
    const req = request.get(url).query(query);
    return this._handle(req, url);
  }
  getUser(command) {
    const url = `${this.userPath}/${command.id}`;
    const req = request.get(url);
    return this._handle(req, url);
  }
  createUser(command) {
    const updatedCommand = command || {};
    // need to mention the client id & redirect url in order to send an confirm email
    // that redirect to the right places when clicked in that email
    updatedCommand.clientId = nconf.get('openid:clientId');
    updatedCommand.redirectURL = `${nconf.get('APP_URL')}/callback`;

    const url = this.userPath;
    const req = request.post(url).set('Content-Type', 'application/json').send(updatedCommand);
    return this._handle(req, url);
  }
  putUser(command) {
    const url = `${this.userPath}/${command.id}`;
    const req = request.put(url).set('Content-Type', 'application/json')
      .send(omit(command, 'id'));
    return this._handle(req, url);
  }
  deleteUser(command) {
    const url = `${this.userPath}/${command.id}`;
    const req = request.delete(url);
    return this._handle(req, url);
  }

  // company
  getCompanies(query) {
    const url = this.companyPath;
    const req = request.get(url).query(query);
    return this._handle(req, url);
  }
  getCompany(command) {
    const url = `${this.companyPath}/${command.id}`;
    const req = request.get(url);
    return this._handle(req, url);
  }
  putCompany(command) {
    const url = `${this.companyPath}/${command.id}`;
    const req = request.put(url).set('Content-Type', 'application/json')
      .send(omit(command, 'id'));
    return this._handle(req, url);
  }

  // access
  getUserPermissions(params) {
    const query = pick(params, ['service', 'company']);
    const url = `${this._options.baseUrl}/access/users/${params.username}/permissions`;
    const req = request.get(url).query(query);
    return this._handle(req, url);
  }
  getRoles(query) {
    const updatedQuery = defaults(query, { service: this._SERVICE_NAME });
    const url = `${this._options.baseUrl}/access/roles`;
    const req = request.get(url).query(updatedQuery);
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
  getUserRoles(command) {
    const url = `${this._options.baseUrl}/access/users/${command.userId}/roles`;
    const query = { service: this._SERVICE_NAME };
    const req = request.get(url).query(query);
    return this._handle(req, url);
  }

  // @TODO wait IAM to update in order to send with one request to set and remove
  async setUserRoles(command) {
    for (const roleId of command.roles) {
      // @TODO add back error handling
      const url = `${this._options.baseUrl}/access/roles/${roleId}/users`;
      await request.post(url)
        .set('Content-Type', 'application/json')
        .send({ username: command.userId });
    }
  }
  async deleteUserRoles(command) {
    for (const roleId of command.roles) {
      // @TODO add back error handling
      const url = `${this._options.baseUrl}/access/users/${roleId}/users/${command.userId}`;
      await request.delete(url);
    }
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
