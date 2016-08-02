import { pick, isString, get } from 'lodash';
import Q from 'q';
import qs from 'query-string';
import fetch from 'isomorphic-fetch';
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

export default class IamServiceClient {
  constructor(options) {
    this._options = options;
  }
  getUserPermissions(params) {
    const query = qs.stringify(pick(params, ['service', 'company']));
    const url = `${this._options.baseUrl}/access/users/${params.username}/permissions?${query}`;
    return this._request(url);
  }
  _request(url, config) {
    return fetch(url, config)
      .then(response => {
        const data = response.json();
        if (response.ok) {
          return data;
        }
        const errorMessages = ['message', 'error.message', 'msg']
          .map(x => get(data, x))
          .filter(m => isString(m) && m.length > 0);
        const errorMessage = errorMessages[0] || '[Empty message]';
        const message = `Request to IAM (${url}) failed with ${response.status}. Message was: ${errorMessage}`;
        logger.error(message, data);
        const error = new HttpStatusError(response.status, message);
        error.response = response;
        return Q.reject(error);
      });
  }
}
