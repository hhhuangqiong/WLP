/** @module requests/whitelist */

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
        return response.applicationDetails.applications;
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

  /**
   * Get the whitelist specified by the carrier ID
   *
   * @param {string} carrierId Carrier ID
   * @param {Object} [opts={}] Optional parameters
   * @param {Whitelist~getCB}
   *
   * @see {@link: http://issuetracking.maaii.com:8090/display/MAAIIP/MUMS+User+Management+by+Carrier+HTTP+API#MUMSUserManagementbyCarrierHTTPAPI-7.GetWhitelist}
   */
  _get(carrierId, contentType, cb) {
    if (!carrierId) throw new Error('`carrierId` is required');
    if (!cb || !_.isFunction(cb)) throw new Error('`cb` is required and must be a function');

    let path  = this._processPath(contentType, carrierId);
    let scope = request.get(path);

    scope.end((err, res) => {
      // TODO DRY this
      if (err) return cb(err);
      if (res.status >= 400) return cb(this.prepareError(res.body.error));
      cb(null, this._trimResponse(contentType, res.body));
    });
  }

}

assign(ApplicationRequest.prototype, errorMixin);

