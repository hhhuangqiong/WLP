import logger from 'winston';
import nconf from 'nconf';
import Q from 'q';
import request from 'superagent';
import util from 'util';
import _ from 'lodash';
import moment from 'moment';
import CountryData from 'country-data';
import qs from 'qs';

import BaseRequest from '../Base';
import jsonSchema from '../../../utils/getSimplifiedJsonSchema.js';

/**
 * Number of milliseconds within the interval.
 */
const INTERVAL = {
  day: 24 * 3600 * 1000,
  hour: 3600 * 1000
};

/**
 * Default types to return when no data can be fetched from the server.
 */
const DEFAULT_TYPES = ['Call-in', 'Call-out', 'SMS', 'IVR'];
/**
 * Default platforms to return when no data can be fetched from the server.
 */
const DEFAULT_PLATFORMS = ['Android', 'IOS'];

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
        },
        STATS: {
          PATH: '/stats/1.0/verification/events/query',
          METHOD: 'GET'
        }
      }
    };

    super(opts);
  }

  /**
   * Formats the `from` and `to` fields from ISO format to timestamp.
   * This method will modify the original object.
   *
   * @method
   * @param {Object} params  The parameter object
   * @returns {Object} The updated object
   */
  convertDateInParamsFromIsoToTimestamp(params) {
    if (moment(params.from).isValid()) {
      params.from = moment(params.from).valueOf();
    }
    if (moment(params.to).isValid()) {
      params.to = moment(params.to).valueOf();
    }

    return params;
  }

  /**
   * Formats the verication type that will send to the server endpoint for query.
   * This method will modify the original object.
   *
   * @method
   * @param {Object} type The verification type
   * @returns {Object} The updated object
   */
  convertVerificationTypes(type) {
    switch (type) {
      case 'call-in': return 'MobileTerminated';
      case 'call-out': return 'MobileOriginated';
      default: return type;
    }
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

        params.type = this.convertVerificationTypes(params.method);
        delete params.method;

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
   * @param {Object} endpoint  The endpoint object
   * @param {Object} params  Formatted query object
   * @param {Function} cb  Callback function
   */
  sendRequest(endpoint, params, cb) {
    let base = this.opts.baseUrl;
    let path = endpoint.PATH;
    let method = endpoint.METHOD;
    let url = util.format('%s%s', base, path);

    logger.debug(`Verification API Endpoint: ${url}?${qs.stringify(params)}`);

    request(method, url)
      .query(params)
      .buffer()
      .timeout(this.opts.timeout)
      .end((err, res) => {
        if (!err) {
          logger.debug(util.format('Received a response from %s: ', url), jsonSchema(res.body));
          cb(null, res.body);
          return;
        }

        // TODO: generalize the network error handling (maybe extending Error class?)
        let error = new Error();
        error.status = err.status;
        error.message = err.message;

        if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
          error.status = 504;
          error.timeout = this.opts.timeout;
        } else if (err.code === 'ENOTFOUND') {
          error.status = 404;
        } else if (err.code === 'ECONNREFUSED') {
          error.status = 500;
        } else if (err.response) {
          // SuperAgent error object structure
          // https://visionmedia.github.io/superagent/#error-handling
          let response = err.response.body;
          error.status = err.status;
          error.code = response.error;
          error.message = response.message;
        }

        logger.debug(util.format('Received a %s response from %s: %s',
          error.status, url, error.message));

        cb(error);
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
    Q.ninvoke(this, 'formatQueryParameters', this.convertDateInParamsFromIsoToTimestamp(params))
      .then((params) => {
        this.sendRequest(this.opts.endpoints.SEARCH, params, cb);
      })
      .catch(cb)
      .done();
  }

  /**
   * Get statistics of verification events from data provider
   * @param  {Object}   params  Parameters in form of object for pass into query
   * @param  {String}   groupBy breakdown type of statistics
   * @param  {Function} cb      Node-style callback function
   */
  getVerificationStats(params, groupBy, cb) {
    params = this.convertDateInParamsFromIsoToTimestamp(_.merge(params, {
      breakdown: groupBy
    }));

    Q.ninvoke(this, 'sendRequest', this.opts.endpoints.STATS, params)
    .then((result) => {
      cb(null, result);
    })
    .catch(cb)
    .done();
  }
}
