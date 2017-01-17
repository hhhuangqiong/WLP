import Q from 'q';
import request from 'superagent';
import { HttpStatusError, ArgumentNullError, ValidationError } from 'common-errors';
import { isString, get, isNumber, omit, forEach, isEqual, merge, cloneDeep, isObject } from 'lodash';
import logger from 'winston';
import _ from 'lodash';
import fs from 'fs';

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
    // deep clone the presetData and merge missing field back to provision data
    mCommand = merge(cloneDeep(presetData), mCommand);
    // compare each field and ensure the data is exactly the same
    forEach(presetData, (value, key) => {
      // check the values whether identical to the preset value
      // since user can configure more setting than preset's value like smsc setting,
      // it will only check the first level non object values
      if (!isObject(value) && !isEqual(mCommand[key], value)) {
        throw new ValidationError(`Data ${key} is invalid`);
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
    const { logo, ...restInfo } = command;
    const updatedCommand = await this.mergeAndValidateProvisionData(restInfo);
    let req = request.post(url);
    if(logo){
      req = req.attach('logo', logo.buffer, logo.originalname);
    }
    req.field('data', JSON.stringify(updatedCommand));
    try {
      const result = await this._handle(req, url);
      return result;
    } catch (err) {
      const error = err;
      error.details = err.response.error.details;
      throw error;
    }
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
      const res = await superagentRequest.timeout(this._options.timeout);
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
