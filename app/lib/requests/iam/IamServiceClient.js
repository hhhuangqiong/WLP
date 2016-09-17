import { pick, isString, get, extend, isNumber, defaults, omit, map } from 'lodash';
import Q from 'q';
import request from 'superagent';
import logger from 'winston';
import { HttpStatusError, ArgumentNullError, NotSupportedError } from 'common-errors';
import nconf from 'nconf';

export class IamClient {
  constructor(options) {
    if (!options.baseUrl) {
      throw new ArgumentNullError('iam client base url');
    }
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
    const url = this.userPath;
    const req = request.post(url).set('Content-Type', 'application/json').send(command);
    return this._handle(req, url);
  }
  requestSetPassword(command) {
    const url = `${this.userPath}/${command.id}/requestSetPassword`;
    // need to mention the client id & redirect url in order to send an confirm email
    // that redirect to the right places when clicked in that email
    const updatedCommand = {
      clientId: nconf.get('openid:clientId'),
      redirectURL: `${nconf.get('APP_URL')}/callback`,
    };
    const req = request.post(url).set('Content-Type', 'application/json').send(updatedCommand);
    return this._handle(req, url)
      .catch(err => {
        let error;
        // handle the specific error for request set password fail error
        const errorBody = err.response;
        if (get(errorBody, 'error.code') === 20006) {
          error = new NotSupportedError(`Fail to deliver email to user ${command.id}`);
          error.response = errorBody;
        } else {
          error = err;
        }
        throw error;
      });
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
  postLogo(command) {
    const url = `${this.companyPath}/company/${command.id}/logo`;
    const req = request.post(url)
      .set('Content-Type', 'multipart/form-data')
      .attach('logo', command.file);
    return this._handle(req, url);
  }
  getDescendantCompany(command) {
    const url = `${this.companyPath}/${command.id}/descendants`;
    const req = request.get(url);
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

  async setUserRoles(command) {
    const url = `${this._options.baseUrl}/access/users/${command.userId}/roles`;
    const query = { service: this._SERVICE_NAME };
    const body = map(command.roles, role => ({ id: role }));
    const req = request.put(url).query(query).send(body);
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

export default IamClient;
