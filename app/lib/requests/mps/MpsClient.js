import Q from 'q';
import request from 'superagent';
import { HttpStatusError } from 'common-errors';
import { isString, get, isNumber } from 'lodash';
import logger from 'winston';

const serviceFilter = ['SDK', 'WHITE_LABEL'];
export default class MpsClient {
  constructor(options) {
    this._options = options;
    this.basePath = this._options.baseUrl;
  }

  getProvision(query) {
    const mQuery = query;
    mQuery.serviceType = serviceFilter.toString();
    const url = `${this.basePath}/provisioning`;
    const req = request.get(url).query(mQuery);
    return this._handle(req, url);
  }

  getProvisionById(command) {
    const url = `${this.basePath}/provisioning/${command.id}`;
    const req = request.get(url);
    return this._handle(req, url);
  }

  postProvision(command) {
    const url = `${this.basePath}/provisioning`;
    const req = request.post(url).send(command);
    return this._handle(req, url);
  }

  getPreset(query) {
    const url = `${this.basePath}/preset/${query.carrierId}`;
    const req = request.get(url).query(query);
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
