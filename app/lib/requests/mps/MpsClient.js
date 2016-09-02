import Q from 'q';
import request from 'superagent';
import { HttpStatusError, ArgumentNullError, ValidationError, NotFoundError } from 'common-errors';
import { isString, get, isNumber, omit, forEach, isEqual, merge } from 'lodash';
import logger from 'winston';

const serviceFilter = ['SDK', 'WHITE_LABEL'];

export default class MpsClient {
  constructor(options) {
    this._options = options;
    if (!options.baseUrl) {
      throw new ArgumentNullError('mps client base url');
    }
    this.basePath = this._options.baseUrl;
  }

  async mergeAndValidateProvisionData(command) {
    let mCommand = command;
    // omit those values to be validated
    const omitPresetInfo = ['presetId', 'createdAt', 'updatedAt'];
    let presetData = {};
    try {
      presetData = await this.getPreset({ presetId: command.resellerCarrierId });
    } catch (ex) {
      // no preset and then no need to check
      return mCommand;
    }
    presetData = omit(presetData, omitPresetInfo);
    // merge missing field back to provision data
    mCommand = merge(presetData, mCommand);
    forEach(presetData, (value, key) => {
      // check the values whether identical to the preset value
      if (!isEqual(mCommand[key], value)) {
        throw new ValidationError(key);
      }
    });
    return mCommand;
  }

  getProvision(query) {
    const mQuery = query;
    mQuery.serviceType = serviceFilter.toString();
    const url = `${this.basePath}/provisioning`;
    const req = request.get(url).query(mQuery);
    return this._handle(req, url);
  }

  async getProvisionById(command) {
    const url = `${this.basePath}/provisioning/${command.id}`;
    const req = request.get(url);
    return this._handle(req, url);
  }

  async postProvision(command) {
    const url = `${this.basePath}/provisioning`;
    const updatedCommand = await this.mergeAndValidateProvisionData(command);
    const req = request.post(url).send(updatedCommand);
    return this._handle(req, url);
  }

  async putProvision(command) {
    const url = `${this.basePath}/provisioning/${command.id}`;
    const updatedCommand = await this.mergeAndValidateProvisionData(command);
    const req = request.put(url).send(omit(updatedCommand, 'id'));
    return this._handle(req, url);
  }

  getPreset(command) {
    const url = `${this.basePath}/preset/${command.presetId}`;
    const req = request.get(url);
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
