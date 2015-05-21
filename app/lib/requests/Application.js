/** @module requests/application */

import _ from 'lodash'
import assign from 'object-assign';
import request from 'superagent';

import errorMixin from '../requests/mixins/mumsErrorResponse';

export const CONTENT_TYPE_APISERVICE    = 'APISERVICE';
export const CONTENT_TYPE_APPLICATIONS  = 'APPLICATIONS';

/**
 * @mixes mixins/mumsErrorResponse
 */
export class ApplicationRequest {

  constructor(opts) {
    if(!opts.baseUrl) throw new Error('`baseUrl is required`');
    this._baseUrl = opts.baseUrl;
    this._timeout = opts.timeout || 5000;
  }

  _processPath(contentType, carrierId) {
    switch(contentType) {
      case CONTENT_TYPE_APISERVICE:
        return `${this._baseUrl}/1.0/carriers/${carrierId}`;
        break;
      case CONTENT_TYPE_APPLICATIONS:
        return `${this._baseUrl}/1.0/carriers/${carrierId}/applications`;
        break;
      default:
        throw new Error('Content Type requested is not available');
        break;
    }
  }

  _trimResponse(contentType, response) {
    switch(contentType) {
      case CONTENT_TYPE_APISERVICE:
        return response.services;
        break;
      case CONTENT_TYPE_APPLICATIONS:
        //return response.applicationDetails.applications;
        return {
          applicationId: response.applicationDetails.applicationIdentifier,
          applications: response.applicationDetails.applications
        };
        break;
      default:
        throw new Error('Content Type requested is not available');
        break;
    }
  }

  getApiService(carrierId, cb) {
    this._get(carrierId, CONTENT_TYPE_APISERVICE, cb);
  }

  getApplications(carrierId, cb) {
    this._get(carrierId, CONTENT_TYPE_APPLICATIONS, cb);
  }

  _get(carrierId, contentType, cb) {
    if (!carrierId) throw new Error('`carrierId` is required');
    if (!cb || !_.isFunction(cb)) throw new Error('`cb` is required and must be a function');

    let path  = this._processPath(contentType, carrierId);
    let scope = request.get(path).timeout(this._timeout);

    scope.end((err, res) => {
      // TODO DRY this
      if (err) return cb(err);
      if (res.status >= 400) return cb(this.prepareError(res.body.error));
      cb(null, this._trimResponse(contentType, res.body));
    });
  }

}

assign(ApplicationRequest.prototype, errorMixin);

