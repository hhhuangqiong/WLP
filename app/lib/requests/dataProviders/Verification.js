import logger from 'winston';
import nconf from 'nconf';
import Q from 'q';
import request from 'superagent';
import util from 'util';
import _ from 'lodash';

import BaseRequest from '../Base';

export default class VerificationRequest extends BaseRequest {
  constructor(baseUrl, timeout) {
    let opts = {
      type: 'dataProviderApi',
      baseUrl: baseUrl,
      timeout: timeout,
      endpoints: {
        SEARCH: {
          PATH: '/api/v1/verification/events/query',
          METHOD: 'GET'
        }
      }
    };

    super(opts);
  }

  /**
   * Formats and normalize query parameters for verification request
   * 
   * @method
   * @param {Object} params  Query parameters object for the request
   * @param {String} params.carrier  The carrier ID
   * @param {String} params.application  The application ID
   * @param {Number} params.from  Unix timestamp in ms
   * @param {Number} params.to  Unix timestamp in ms
   * @param {Number} [params.page=0]  Page number
   * @param {Number} [params.size=20]  Page size
   * @param {String} [params.method]  Verification method
   * @param {String} [params.platform]  The device platform (i.e. android, ios, etc.)
   * @param {String} [params.phone_number]  The wildcard phone number for searching
   * @param {Function} cb  Node-style callback function
   */
  formatQueryParameters(params, cb) {
    Q.ninvoke(this, 'swapDate', params)
      .then((params) => {
        let format = nconf.get(util.format('%s:format:timestamp', this.opts.type)) || 'x';
        return this.formatDateString(params, format)
      })
      .then((params) => {
        cb(null, params);
      })
      .catch((err) => {
        cb(this.handleError(err, 500), null);
      })
      .done();
  }

  /**
   * Send request with SuperAgent
   *
   * @method
   * @param {Object} params  Formatted query object
   * @param {Function} cb  Callback function
   */
  sendRequest(params, cb) {
    let base = this.opts.baseUrl;
    let path = this.opts.endpoints.SEARCH.PATH;
    let method = this.opts.endpoints.SEARCH.METHOD;
    let url = util.format('%s%s', base, path);

    logger.debug(util.format('Send a %s request to `%s` with parameters: ', method, url), params);

    request(method, url)
      .query(params)
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (err) {
          cb(this.handleError(err, err.status || 400));
          return;
        }

        cb(null, res.body);
      });
  }

  /**
   * Sends a request to data provider to retrieve the data
   * filtered by the criteria specified params object.
   *
   * @method
   * @param {Object} params  Raw query parameter object
   * @param {Function} cb  Node-style callback function 
   */
  getVerifications(params, cb) {
    Q.ninvoke(this, 'formatQueryParameters', params)
      .then((params) => {
        this.sendRequest(params, cb);
      })
      .catch((err) => {
        cb(this.handleError(err, err.status || 500));
      })
      .done();
  }
}